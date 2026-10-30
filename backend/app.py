import os
import sys
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import or_, and_, desc, asc, func
from sqlalchemy.orm import joinedload, selectinload

# Ensure backend folder is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine, get_db_status
from models import Mission, Organization, Hardware, HardwareAlias, HardwareKeyword, HardwareImage, HardwareSource
from mission_hierarchy import (
    DESTINATION_ORDER,
    apply_mission_classifications,
    ensure_mission_hierarchy_schema,
)

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS
cors_origin = os.getenv("CORS_ORIGIN", "*")
CORS(app, origins=[cors_origin, "http://localhost:5173", "http://127.0.0.1:5173"], supports_credentials=True)


def bootstrap_database():
    """Create tables and ensure the full verified dataset is present.

    Both ingestion steps are idempotent, so this safely upgrades databases
    that were created before the extended dataset was wired in.
    """
    from seed_data import seed_database
    from expand_db import expand_database

    try:
        seed_database()
        ensure_mission_hierarchy_schema(engine)
        expand_database()
        db = SessionLocal()
        try:
            apply_mission_classifications(db)
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Database bootstrap failed: {e}")


bootstrap_database()

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
    """Return a destination -> programme -> mission hierarchy from mission records."""
    db = SessionLocal()
    try:
        missions = db.query(Mission).options(
            selectinload(Mission.hardware_items).joinedload(Hardware.operator),
            selectinload(Mission.hardware_items).joinedload(Hardware.mission_agency),
            selectinload(Mission.hardware_items).joinedload(Hardware.manufacturer),
        ).all()

        destinations = {}
        all_object_types = set()
        all_statuses = set()
        all_org_names = set()
        for mission in missions:
            destination = mission.destination or "Other / Multiple Destinations"
            programme = mission.programme or "Standalone Missions"
            destination_node = destinations.setdefault(destination, {})
            programme_node = destination_node.setdefault(programme, [])
            hardware_items = []

            for hardware in mission.hardware_items:
                organizations = sorted({
                    organization.name
                    for organization in (
                        hardware.operator,
                        hardware.mission_agency,
                        hardware.manufacturer,
                    )
                    if organization
                })
                organization = (
                    hardware.operator.name if hardware.operator else
                    (hardware.mission_agency.name if hardware.mission_agency else
                     (hardware.manufacturer.name if hardware.manufacturer else "Unassigned"))
                )
                all_object_types.add(hardware.object_type)
                all_statuses.add(hardware.operational_status)
                all_org_names.add(organization)
                all_org_names.update(organizations)
                hardware_items.append({
                    "id": hardware.id,
                    "name": hardware.name,
                    "slug": hardware.slug,
                    "operational_status": hardware.operational_status,
                    "verification_status": hardware.verification_status,
                    "primary_organization": organization,
                    "organizations": organizations,
                })

            hardware_items.sort(key=lambda item: (item["name"].casefold(), item["id"]))
            programme_node.append({
                "id": mission.id,
                "name": mission.name,
                "launch_date": mission.launch_date,
                "mission_status": mission.mission_status,
                "classification_status": mission.classification_status or "Provisional",
                "hardware_count": len(hardware_items),
                "hardware": hardware_items,
            })

        def mission_sort_key(mission):
            return (mission["launch_date"] or "9999", mission["name"].casefold())

        hierarchy = []
        for destination in sorted(
            destinations,
            key=lambda name: (
                DESTINATION_ORDER.index(name) if name in DESTINATION_ORDER else len(DESTINATION_ORDER),
                name.casefold(),
            ),
        ):
            programme_nodes = []
            for programme, programme_missions in destinations[destination].items():
                programme_missions.sort(key=mission_sort_key)
                programme_nodes.append({
                    "name": programme,
                    "count": len(programme_missions),
                    "missions": programme_missions,
                    "first_launch_date": min(
                        (mission["launch_date"] or "9999" for mission in programme_missions),
                        default="9999",
                    ),
                })
            programme_nodes.sort(
                key=lambda node: (node["first_launch_date"], node["name"].casefold())
            )
            for programme in programme_nodes:
                programme.pop("first_launch_date")
            mission_count = sum(programme["count"] for programme in programme_nodes)
            hierarchy.append({
                "destination": destination,
                "count": mission_count,
                "programmes": programme_nodes,
            })

        return jsonify({
            "hierarchy": hierarchy,
            "filter_options": {
                "destinations": [item["destination"] for item in hierarchy],
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
                    Hardware.mission.has(Mission.programme.ilike(search_pattern)),
                    Hardware.mission.has(Mission.destination.ilike(search_pattern)),
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
        query = query.filter(or_(
            Hardware.mission.has(Mission.destination.ilike(destination)),
            Hardware.destination.ilike(destination),
            Hardware.mission.has(Mission.destination_category.ilike(destination)),
        ))

    programme = params.get("programme", "").strip()
    if programme and programme.lower() != "all":
        query = query.filter(Hardware.mission.has(Mission.programme.ilike(programme)))

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

@app.route("/api/hardware/<identifier>", methods=["GET"])
def get_hardware_detail(identifier):
    """Returns complete details of a single hardware item by ID or slug."""
    db = SessionLocal()
    try:
        query = db.query(Hardware).options(
            joinedload(Hardware.mission),
            joinedload(Hardware.operator),
            joinedload(Hardware.mission_agency),
            joinedload(Hardware.manufacturer),
            joinedload(Hardware.aliases),
            joinedload(Hardware.keywords),
            joinedload(Hardware.images),
            joinedload(Hardware.sources)
        )
        
        if str(identifier).isdigit():
            hw = query.filter(Hardware.id == int(identifier)).first()
        else:
            hw = query.filter(Hardware.slug == identifier).first()

        if not hw:
            return jsonify({"error": f"Hardware item '{identifier}' not found"}), 404

        return jsonify(hw.to_dict(full=True)), 200

    except Exception as e:
        logger.error(f"Error fetching hardware detail for '{identifier}': {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route("/api/hardware/<identifier>/images", methods=["GET"])
def get_hardware_images(identifier):
    """Returns up to 10 images and related visualizations for a hardware item by ID or slug."""
    db = SessionLocal()
    try:
        hw_id = None
        if str(identifier).isdigit():
            hw_id = int(identifier)
        else:
            hw = db.query(Hardware.id).filter(Hardware.slug == identifier).first()
            if hw:
                hw_id = hw[0]

        if not hw_id:
            return jsonify({"error": f"Hardware item '{identifier}' not found"}), 404

        images = db.query(HardwareImage).filter(HardwareImage.hardware_id == hw_id).limit(10).all()
        return jsonify({
            "hardware_id": hw_id,
            "count": len(images),
            "images": [img.to_dict() for img in images]
        }), 200
    except Exception as e:
        logger.error(f"Error fetching images for hardware '{identifier}': {e}")
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
            query = query.filter(or_(
                Mission.destination.ilike(destination),
                Mission.destination_category.ilike(destination),
            ))
        
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
