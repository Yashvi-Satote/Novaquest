import os
import sys
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import or_, and_, desc, asc, func
from sqlalchemy.orm import joinedload

# Ensure backend folder is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, get_db_status
from models import Mission, Organization, Hardware, HardwareAlias, HardwareKeyword, HardwareImage, HardwareSource

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS
cors_origin = os.getenv("CORS_ORIGIN", "*")
CORS(app, origins=[cors_origin, "http://localhost:5173", "http://127.0.0.1:5173"], supports_credentials=True)

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint reporting backend and database status."""
    db_status = get_db_status()
    db = SessionLocal()
    hardware_count = 0
    try:
        hardware_count = db.query(Hardware).count()
    except Exception as e:
        logger.error(f"Error querying hardware count: {e}")
    finally:
        db.close()

    return jsonify({
        "status": "healthy",
        "service": "Space Hardware Explorer API",
        "version": "1.0.0",
        "database": db_status["engine"],
        "database_connected": db_status["status"] == "connected",
        "postgres_active": db_status["is_postgres"],
        "database_message": db_status["message"],
        "hardware_records_count": hardware_count
    }), 200

@app.route("/api/filters", methods=["GET"])
def get_filters():
    """
    Returns dynamic categories, missions, statuses, organizations, and counts.
    Builds the hierarchical tree:
    Mission Category (Mars, Moon, Deep Space, Earth Orbit) -> Mission -> Status -> Organization -> Hardware
    """
    db = SessionLocal()
    try:
        # Canonical order: Mars, Moon, Deep Space, then any others (e.g. Earth Orbit)
        canonical_destinations = ["Mars", "Moon", "Deep Space", "Earth Orbit"]
        
        # Fetch all hardware with joined relations
        hardware_records = db.query(Hardware).options(
            joinedload(Hardware.mission),
            joinedload(Hardware.operator),
            joinedload(Hardware.mission_agency),
            joinedload(Hardware.manufacturer)
        ).all()

        # Build hierarchical tree
        tree = {}
        for dest in canonical_destinations:
            tree[dest] = {
                "category": dest,
                "total_count": 0,
                "missions": {}
            }

        # Available flat filter options for chips/dropdowns
        all_object_types = set()
        all_statuses = set()
        all_org_names = set()

        for hw in hardware_records:
            dest = hw.destination
            if dest not in tree:
                tree[dest] = {
                    "category": dest,
                    "total_count": 0,
                    "missions": {}
                }
            
            tree[dest]["total_count"] += 1
            all_object_types.add(hw.object_type)
            all_statuses.add(hw.operational_status)

            # Determine primary org name
            org_name = (
                hw.operator.name if hw.operator else
                (hw.mission_agency.name if hw.mission_agency else
                (hw.manufacturer.name if hw.manufacturer else "Unassigned"))
            )
            all_org_names.add(org_name)

            mission_name = hw.mission.name if hw.mission else "Independent / Unassigned"
            mission_id = hw.mission_id if hw.mission else None

            # Mission level
            if mission_name not in tree[dest]["missions"]:
                tree[dest]["missions"][mission_name] = {
                    "id": mission_id,
                    "name": mission_name,
                    "count": 0,
                    "statuses": {}
                }
            tree[dest]["missions"][mission_name]["count"] += 1

            # Status level
            status_group = hw.operational_status
            if status_group not in tree[dest]["missions"][mission_name]["statuses"]:
                tree[dest]["missions"][mission_name]["statuses"][status_group] = {
                    "status": status_group,
                    "count": 0,
                    "organizations": {}
                }
            tree[dest]["missions"][mission_name]["statuses"][status_group]["count"] += 1

            # Organization level
            if org_name not in tree[dest]["missions"][mission_name]["statuses"][status_group]["organizations"]:
                tree[dest]["missions"][mission_name]["statuses"][status_group]["organizations"][org_name] = {
                    "name": org_name,
                    "count": 0,
                    "hardware": []
                }
            tree[dest]["missions"][mission_name]["statuses"][status_group]["organizations"][org_name]["count"] += 1
            tree[dest]["missions"][mission_name]["statuses"][status_group]["organizations"][org_name]["hardware"].append({
                "id": hw.id,
                "name": hw.name,
                "slug": hw.slug
            })

        # Format hierarchy into list conforming to canonical ordering
        hierarchy = []
        for dest in canonical_destinations:
            if dest in tree and tree[dest]["total_count"] > 0:
                cat_data = tree[dest]
                # Convert missions dict to sorted list
                missions_list = []
                for m_name in sorted(cat_data["missions"].keys()):
                    m_data = cat_data["missions"][m_name]
                    # Convert statuses to sorted list
                    statuses_list = []
                    for s_name in sorted(m_data["statuses"].keys()):
                        s_data = m_data["statuses"][s_name]
                        # Convert organizations to sorted list
                        orgs_list = []
                        for o_name in sorted(s_data["organizations"].keys()):
                            o_data = s_data["organizations"][o_name]
                            orgs_list.append(o_data)
                        statuses_list.append({
                            "status": s_name,
                            "count": s_data["count"],
                            "organizations": orgs_list
                        })
                    missions_list.append({
                        "id": m_data["id"],
                        "name": m_name,
                        "count": m_data["count"],
                        "statuses": statuses_list
                    })
                
                hierarchy.append({
                    "category": dest,
                    "count": cat_data["total_count"],
                    "missions": missions_list
                })

        return jsonify({
            "hierarchy": hierarchy,
            "filter_options": {
                "destinations": [h["category"] for h in hierarchy],
                "statuses": sorted(list(all_statuses)),
                "object_types": sorted(list(all_object_types)),
                "organizations": sorted(list(all_org_names))
            }
        }), 200

    except Exception as e:
        logger.error(f"Error compiling filter tree: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

def build_hardware_query(db, params):
    """Builds filtered and searched SQLAlchemy query for hardware records."""
    query = db.query(Hardware).options(
        joinedload(Hardware.mission),
        joinedload(Hardware.operator),
        joinedload(Hardware.mission_agency),
        joinedload(Hardware.manufacturer),
        joinedload(Hardware.images)
    )

    # 1. Keyword search (q)
    search_q = params.get("q", "").strip()
    if search_q:
        keywords = search_q.split()
        for word in keywords:
            search_pattern = f"%{word}%"
            # Match against Hardware fields, aliases, and keywords
            query = query.filter(
                or_(
                    Hardware.name.ilike(search_pattern),
                    Hardware.slug.ilike(search_pattern),
                    Hardware.destination.ilike(search_pattern),
                    Hardware.object_type.ilike(search_pattern),
                    Hardware.operational_status.ilike(search_pattern),
                    Hardware.short_description.ilike(search_pattern),
                    Hardware.educational_description.ilike(search_pattern),
                    Hardware.scientific_purpose.ilike(search_pattern),
                    Hardware.hardware_materials.ilike(search_pattern),
                    Hardware.location_description.ilike(search_pattern),
                    Hardware.mission.has(Mission.name.ilike(search_pattern)),
                    Hardware.manufacturer.has(Organization.name.ilike(search_pattern)),
                    Hardware.operator.has(Organization.name.ilike(search_pattern)),
                    Hardware.mission_agency.has(Organization.name.ilike(search_pattern)),
                    Hardware.aliases.any(HardwareAlias.alias.ilike(search_pattern)),
                    Hardware.keywords.any(HardwareKeyword.keyword.ilike(search_pattern))
                )
            )

    # 2. Destination filter
    destination = params.get("destination", "").strip()
    if destination and destination.lower() != "all":
        query = query.filter(Hardware.destination.ilike(destination))

    # 3. Mission filter
    mission_id = params.get("mission_id")
    if mission_id and mission_id != "all":
        try:
            query = query.filter(Hardware.mission_id == int(mission_id))
        except ValueError:
            pass

    mission_name = params.get("mission", "").strip()
    if mission_name and mission_name.lower() != "all":
        query = query.filter(Hardware.mission.has(Mission.name.ilike(mission_name)))

    # 4. Operational status filter
    status = params.get("status", "").strip()
    if status and status.lower() != "all":
        query = query.filter(Hardware.operational_status.ilike(status))

    # 5. Organization filter
    org_id = params.get("organization_id")
    if org_id and org_id != "all":
        try:
            oid = int(org_id)
            query = query.filter(
                or_(
                    Hardware.operator_id == oid,
                    Hardware.mission_agency_id == oid,
                    Hardware.manufacturer_id == oid
                )
            )
        except ValueError:
            pass

    org_name = params.get("organization", "").strip()
    if org_name and org_name.lower() != "all":
        query = query.filter(
            or_(
                Hardware.operator.has(Organization.name.ilike(org_name)),
                Hardware.mission_agency.has(Organization.name.ilike(org_name)),
                Hardware.manufacturer.has(Organization.name.ilike(org_name))
            )
        )

    # 6. Object Type filter
    obj_type = params.get("object_type", "").strip()
    if obj_type and obj_type.lower() != "all":
        query = query.filter(Hardware.object_type.ilike(obj_type))

    # 7. Sorting
    sort_by = params.get("sort_by", "launch_date_desc")
    if sort_by == "name_asc":
        query = query.order_by(asc(Hardware.name))
    elif sort_by == "name_desc":
        query = query.order_by(desc(Hardware.name))
    elif sort_by == "launch_date_asc":
        query = query.order_by(asc(Hardware.launch_date))
    elif sort_by == "launch_date_desc":
        query = query.order_by(desc(Hardware.launch_date))
    elif sort_by == "status":
        query = query.order_by(asc(Hardware.operational_status), desc(Hardware.launch_date))
    else:
        query = query.order_by(desc(Hardware.launch_date))

    return query

@app.route("/api/hardware", methods=["GET"])
def get_hardware_list():
    """Returns paginated hardware list with filtering."""
    db = SessionLocal()
    try:
        # Pagination params
        page = max(1, int(request.args.get("page", 1)))
        limit = min(50, max(1, int(request.args.get("limit", 20))))
        offset = (page - 1) * limit

        query = build_hardware_query(db, request.args)
        total_count = query.count()
        records = query.offset(offset).limit(limit).all()

        return jsonify({
            "items": [h.to_dict(full=False) for h in records],
            "total": total_count,
            "page": page,
            "limit": limit,
            "total_pages": (total_count + limit - 1) // limit if total_count > 0 else 1
        }), 200

    except Exception as e:
        logger.error(f"Error fetching hardware list: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route("/api/hardware/search", methods=["GET"])
def search_hardware():
    """Keyword search across all fields, delegating to the unified query builder."""
    return get_hardware_list()

@app.route("/api/hardware/<int:hardware_id>", methods=["GET"])
def get_hardware_detail(hardware_id):
    """Returns complete details of a single hardware item."""
    db = SessionLocal()
    try:
        hw = db.query(Hardware).options(
            joinedload(Hardware.mission),
            joinedload(Hardware.operator),
            joinedload(Hardware.mission_agency),
            joinedload(Hardware.manufacturer),
            joinedload(Hardware.aliases),
            joinedload(Hardware.keywords),
            joinedload(Hardware.images),
            joinedload(Hardware.sources)
        ).filter(Hardware.id == hardware_id).first()

        if not hw:
            return jsonify({"error": f"Hardware item with ID {hardware_id} not found"}), 404

        return jsonify(hw.to_dict(full=True)), 200

    except Exception as e:
        logger.error(f"Error fetching hardware detail for ID {hardware_id}: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route("/api/hardware/<int:hardware_id>/images", methods=["GET"])
def get_hardware_images(hardware_id):
    """Returns up to 10 images and related visualizations for a hardware item with attribution."""
    db = SessionLocal()
    try:
        images = db.query(HardwareImage).filter(HardwareImage.hardware_id == hardware_id).limit(10).all()
        return jsonify({
            "hardware_id": hardware_id,
            "count": len(images),
            "images": [img.to_dict() for img in images]
        }), 200
    except Exception as e:
        logger.error(f"Error fetching images for hardware {hardware_id}: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route("/api/missions", methods=["GET"])
def get_missions():
    """Returns list of missions."""
    db = SessionLocal()
    try:
        destination = request.args.get("destination")
        query = db.query(Mission).options(joinedload(Mission.hardware_items))
        if destination:
            query = query.filter(Mission.destination_category.ilike(destination))
        
        missions = query.all()
        return jsonify({
            "count": len(missions),
            "missions": [m.to_dict(include_hardware_count=True) for m in missions]
        }), 200
    except Exception as e:
        logger.error(f"Error fetching missions: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route("/api/missions/<int:mission_id>/hardware", methods=["GET"])
def get_mission_hardware(mission_id):
    """Returns all hardware items belonging to a specific mission."""
    db = SessionLocal()
    try:
        hardware_items = db.query(Hardware).options(
            joinedload(Hardware.mission),
            joinedload(Hardware.operator),
            joinedload(Hardware.mission_agency),
            joinedload(Hardware.manufacturer)
        ).filter(Hardware.mission_id == mission_id).all()

        return jsonify({
            "mission_id": mission_id,
            "count": len(hardware_items),
            "items": [h.to_dict(full=False) for h in hardware_items]
        }), 200
    except Exception as e:
        logger.error(f"Error fetching hardware for mission {mission_id}: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route("/api/organizations", methods=["GET"])
def get_organizations():
    """Returns list of all registered organizations."""
    db = SessionLocal()
    try:
        orgs = db.query(Organization).order_by(asc(Organization.name)).all()
        return jsonify({
            "count": len(orgs),
            "organizations": [o.to_dict() for o in orgs]
        }), 200
    except Exception as e:
        logger.error(f"Error fetching organizations: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    print(f"Starting Space Hardware Explorer Backend on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=debug)
