import os
import sys
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sqlalchemy import or_, and_, desc, asc, func
from sqlalchemy.orm import joinedload, selectinload

# Ensure the backend package root is available when this module is run directly.
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from Shared.database import SessionLocal, get_db_status
from NovaBase.models import (
    Mission,
    Organization,
    Spacecraft,
    Hardware,
    Model3D,
    MissionSpacecraft,
    SpacecraftAlias,
    SpacecraftKeyword,
    SpacecraftImage,
    SpacecraftSource
)

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS
cors_origin = os.getenv("CORS_ORIGIN", "*")
CORS(app, origins=[cors_origin, "http://localhost", "http://127.0.0.1", "http://localhost:80", "http://127.0.0.1:80", "http://localhost:5173", "http://127.0.0.1:5173"], supports_credentials=True)

# Locate models repository directory
POSSIBLE_MODELS_DIRS = [
    os.path.abspath(os.path.join(backend_dir, "..", "..", "spacecraft-models", "models")),
    os.path.abspath(os.path.join(backend_dir, "..", "spacecraft-models", "models")),
    r"C:\Users\LENOVO\.gemini\antigravity\scratch\novaquest_workspace\spacecraft-models\models"
]
MODELS_BASE_DIR = None
for p in POSSIBLE_MODELS_DIRS:
    if os.path.exists(p):
        MODELS_BASE_DIR = p
        break


def bootstrap_database():
    """Ensure the scalable database schema and complete 122 spacecraft records are present."""
    from NovaBase.migrate_and_import import run_migration_and_import

    try:
        run_migration_and_import()
    except Exception as e:
        logger.error(f"Database bootstrap failed: {e}")


bootstrap_database()


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint reporting backend and database status."""
    db_status = get_db_status()
    db = SessionLocal()
    spacecraft_count = 0
    missions_count = 0
    models_count = 0
    try:
        spacecraft_count = db.query(Spacecraft).count()
        missions_count = db.query(Mission).count()
        models_count = db.query(Model3D).count()
    except Exception as e:
        logger.error(f"Error querying counts: {e}")
    finally:
        db.close()

    return jsonify({
        "status": "healthy",
        "service": "Novaquest Space Hardware & Missions API",
        "version": "2.0.0",
        "database": db_status["engine"],
        "database_connected": db_status["status"] == "connected",
        "postgres_active": db_status["is_postgres"],
        "database_message": db_status["message"],
        "hardware_records_count": spacecraft_count,
        "spacecraft_records_count": spacecraft_count,
        "missions_count": missions_count,
        "models_count": models_count
    }), 200


@app.route("/api/filters", methods=["GET"])
def get_filters():
    """
    Returns dynamic categories, missions, statuses, organizations, and counts.
    Builds the hierarchical tree:
    Mission Category -> Mission -> Status -> Organization -> Spacecraft
    """
    db = SessionLocal()
    try:
        canonical_destinations = ["Deep Space", "Mars", "Moon", "Earth Orbit", "Heliophysics", "Asteroids & Comets"]
        
        # Fetch all spacecraft with joined relations
        records = db.query(Spacecraft).options(
            joinedload(Spacecraft.primary_mission),
            joinedload(Spacecraft.missions),
            joinedload(Spacecraft.operator),
            joinedload(Spacecraft.mission_agency),
            joinedload(Spacecraft.manufacturer),
            joinedload(Spacecraft.model_3d)
        ).all()

        tree = {dest: {"category": dest, "total_count": 0, "missions": {}} for dest in canonical_destinations}

        all_object_types = set()
        all_statuses = set()
        all_org_names = set()

        for sc in records:
            dest = sc.destination_category or "Deep Space"
            if dest not in tree:
                tree[dest] = {"category": dest, "total_count": 0, "missions": {}}
            
            tree[dest]["total_count"] += 1
            all_object_types.add(sc.object_type)
            all_statuses.add(sc.operational_status)

            org_name = (
                sc.operator.name if sc.operator else
                (sc.mission_agency.name if sc.mission_agency else
                (sc.manufacturer.name if sc.manufacturer else "NASA"))
            )
            all_org_names.add(org_name)

            active_mission = sc.mission
            mission_name = active_mission.name if active_mission else "Independent Exploration"
            mission_id = active_mission.id if active_mission else None

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
            status_group = sc.operational_status
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
                "id": sc.id,
                "name": sc.display_name or sc.name,
                "slug": sc.slug,
                "has_model": sc.model_3d is not None
            })

        hierarchy = []
        for dest in canonical_destinations:
            if dest in tree and tree[dest]["total_count"] > 0:
                cat_data = tree[dest]
                missions_list = []
                for m_name in sorted(cat_data["missions"].keys()):
                    m_data = cat_data["missions"][m_name]
                    statuses_list = []
                    for s_name in sorted(m_data["statuses"].keys()):
                        s_data = m_data["statuses"][s_name]
                        orgs_list = []
                        for o_name in sorted(s_data["organizations"].keys()):
                            orgs_list.append(s_data["organizations"][o_name])
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


def build_spacecraft_query(db, params):
    """Builds filtered and searched SQLAlchemy query for spacecraft records."""
    query = db.query(Spacecraft).options(
        joinedload(Spacecraft.primary_mission),
        joinedload(Spacecraft.missions),
        joinedload(Spacecraft.operator),
        joinedload(Spacecraft.mission_agency),
        joinedload(Spacecraft.manufacturer),
        joinedload(Spacecraft.model_3d),
        joinedload(Spacecraft.images)
    )

    # 1. Keyword search (q)
    search_q = params.get("q", "").strip()
    if search_q:
        keywords = search_q.split()
        for word in keywords:
            search_pattern = f"%{word}%"
            query = query.filter(
                or_(
                    Spacecraft.name.ilike(search_pattern),
                    Spacecraft.slug.ilike(search_pattern),
                    Spacecraft.display_name.ilike(search_pattern),
                    Spacecraft.full_name.ilike(search_pattern),
                    Spacecraft.destination_category.ilike(search_pattern),
                    Spacecraft.object_type.ilike(search_pattern),
                    Spacecraft.operational_status.ilike(search_pattern),
                    Spacecraft.short_description.ilike(search_pattern),
                    Spacecraft.educational_description.ilike(search_pattern),
                    Spacecraft.scientific_purpose.ilike(search_pattern),
                    Spacecraft.primary_mission.has(Mission.name.ilike(search_pattern)),
                    Spacecraft.missions.any(Mission.name.ilike(search_pattern)),
                    Spacecraft.aliases.any(SpacecraftAlias.alias.ilike(search_pattern)),
                    Spacecraft.keywords.any(SpacecraftKeyword.keyword.ilike(search_pattern))
                )
            )

    # 2. Destination filter
    destination = params.get("destination", "").strip()
    if destination and destination.lower() != "all":
        query = query.filter(
            or_(
                Spacecraft.destination_category.ilike(destination),
                Spacecraft.destination.ilike(destination)
            )
        )

    # 3. Mission filter
    mission_id = params.get("mission_id")
    if mission_id and mission_id != "all":
        try:
            mid = int(mission_id)
            query = query.filter(
                or_(
                    Spacecraft.primary_mission_id == mid,
                    Spacecraft.missions.any(Mission.id == mid)
                )
            )
        except ValueError:
            pass

    mission_name = params.get("mission", "").strip()
    if mission_name and mission_name.lower() != "all":
        query = query.filter(
            or_(
                Spacecraft.primary_mission.has(Mission.name.ilike(mission_name)),
                Spacecraft.missions.any(Mission.name.ilike(mission_name))
            )
        )

    # 4. Operational status filter
    status = params.get("status", "").strip()
    if status and status.lower() != "all":
        query = query.filter(Spacecraft.operational_status.ilike(status))

    # 5. Organization filter
    org_id = params.get("organization_id")
    if org_id and org_id != "all":
        try:
            oid = int(org_id)
            query = query.filter(
                or_(
                    Spacecraft.operator_id == oid,
                    Spacecraft.mission_agency_id == oid,
                    Spacecraft.manufacturer_id == oid
                )
            )
        except ValueError:
            pass

    org_name = params.get("organization", "").strip()
    if org_name and org_name.lower() != "all":
        query = query.filter(
            or_(
                Spacecraft.operator.has(Organization.name.ilike(org_name)),
                Spacecraft.mission_agency.has(Organization.name.ilike(org_name)),
                Spacecraft.manufacturer.has(Organization.name.ilike(org_name))
            )
        )

    # 6. Object Type filter
    obj_type = params.get("object_type", "").strip()
    if obj_type and obj_type.lower() != "all":
        query = query.filter(Spacecraft.object_type.ilike(obj_type))

    # 7. Sorting
    sort_by = params.get("sort_by", "name_asc")
    if sort_by == "name_asc":
        query = query.order_by(asc(Spacecraft.display_name))
    elif sort_by == "name_desc":
        query = query.order_by(desc(Spacecraft.display_name))
    elif sort_by == "launch_date_asc":
        query = query.order_by(asc(Spacecraft.launch_date))
    elif sort_by == "launch_date_desc":
        query = query.order_by(desc(Spacecraft.launch_date))
    elif sort_by == "status":
        query = query.order_by(asc(Spacecraft.operational_status), asc(Spacecraft.display_name))
    else:
        query = query.order_by(asc(Spacecraft.display_name))

    return query


@app.route("/api/hardware", methods=["GET"])
@app.route("/api/spacecraft", methods=["GET"])
def get_spacecraft_list():
    """Returns paginated spacecraft list with complete 3D model references."""
    db = SessionLocal()
    try:
        page = max(1, int(request.args.get("page", 1)))
        limit = min(150, max(1, int(request.args.get("limit", 20))))
        offset = (page - 1) * limit

        query = build_spacecraft_query(db, request.args)
        total_count = query.count()
        records = query.offset(offset).limit(limit).all()

        return jsonify({
            "items": [sc.to_dict(full=False) for sc in records],
            "total": total_count,
            "page": page,
            "limit": limit,
            "total_pages": (total_count + limit - 1) // limit if total_count > 0 else 1
        }), 200

    except Exception as e:
        logger.error(f"Error fetching spacecraft list: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.route("/api/hardware/search", methods=["GET"])
@app.route("/api/spacecraft/search", methods=["GET"])
def search_spacecraft():
    """Keyword search across all fields."""
    return get_spacecraft_list()


@app.route("/api/hardware/<identifier>", methods=["GET"])
@app.route("/api/spacecraft/<identifier>", methods=["GET"])
def get_spacecraft_detail(identifier):
    """Returns complete details of a single spacecraft item by ID, slug, or name, including 3D model reference."""
    db = SessionLocal()
    try:
        query = db.query(Spacecraft).options(
            joinedload(Spacecraft.primary_mission),
            joinedload(Spacecraft.missions),
            joinedload(Spacecraft.operator),
            joinedload(Spacecraft.mission_agency),
            joinedload(Spacecraft.manufacturer),
            joinedload(Spacecraft.model_3d),
            joinedload(Spacecraft.aliases),
            joinedload(Spacecraft.keywords),
            joinedload(Spacecraft.images),
            joinedload(Spacecraft.sources)
        )
        
        sc = None
        if str(identifier).isdigit():
            sc = query.filter(Spacecraft.id == int(identifier)).first()
        
        if not sc:
            sc = query.filter(Spacecraft.slug == identifier.lower()).first()

        if not sc:
            sc = query.filter(Spacecraft.name == identifier.lower()).first()

        if not sc:
            # Check aliases
            alias_match = db.query(SpacecraftAlias).filter(SpacecraftAlias.alias.ilike(identifier)).first()
            if alias_match:
                sc = query.filter(Spacecraft.id == alias_match.spacecraft_id).first()

        if not sc:
            return jsonify({"error": f"Spacecraft '{identifier}' not found"}), 404

        return jsonify(sc.to_dict(full=True)), 200

    except Exception as e:
        logger.error(f"Error fetching spacecraft detail for '{identifier}': {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.route("/api/hardware/<identifier>/images", methods=["GET"])
@app.route("/api/spacecraft/<identifier>/images", methods=["GET"])
def get_spacecraft_images(identifier):
    """Returns images for a spacecraft by ID or slug."""
    db = SessionLocal()
    try:
        sc_id = None
        if str(identifier).isdigit():
            sc_id = int(identifier)
        else:
            sc = db.query(Spacecraft.id).filter(or_(Spacecraft.slug == identifier, Spacecraft.name == identifier)).first()
            if sc:
                sc_id = sc[0]

        if not sc_id:
            return jsonify({"error": f"Spacecraft '{identifier}' not found"}), 404

        images = db.query(SpacecraftImage).filter(SpacecraftImage.spacecraft_id == sc_id).limit(10).all()
        return jsonify({
            "spacecraft_id": sc_id,
            "count": len(images),
            "images": [img.to_dict() for img in images]
        }), 200
    except Exception as e:
        logger.error(f"Error fetching images for '{identifier}': {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.route("/api/missions", methods=["GET"])
def get_missions():
    """Returns list of missions with hardware/spacecraft count."""
    db = SessionLocal()
    try:
        destination = request.args.get("destination")
        query = db.query(Mission).options(
            selectinload(Mission.spacecraft_items),
            selectinload(Mission.primary_spacecraft_items)
        )
        if destination and destination.lower() != "all":
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


@app.route("/api/missions/<int:mission_id>", methods=["GET"])
def get_mission_detail(mission_id):
    """
    Returns complete details of a specific mission, its associated spacecraft,
    and their corresponding 3D model references.
    """
    db = SessionLocal()
    try:
        mission = db.query(Mission).options(
            selectinload(Mission.spacecraft_items).joinedload(Spacecraft.model_3d),
            selectinload(Mission.primary_spacecraft_items).joinedload(Spacecraft.model_3d)
        ).filter(Mission.id == mission_id).first()

        if not mission:
            return jsonify({"error": f"Mission ID {mission_id} not found"}), 404

        data = mission.to_dict(include_hardware_count=True, include_spacecraft=True)
        return jsonify(data), 200
    except Exception as e:
        logger.error(f"Error fetching mission detail for {mission_id}: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.route("/api/missions/<int:mission_id>/hardware", methods=["GET"])
@app.route("/api/missions/<int:mission_id>/spacecraft", methods=["GET"])
def get_mission_spacecraft(mission_id):
    """Returns all spacecraft associated with a specific mission, including their 3D models."""
    db = SessionLocal()
    try:
        mission = db.query(Mission).filter(Mission.id == mission_id).first()
        if not mission:
            return jsonify({"error": f"Mission ID {mission_id} not found"}), 404

        spacecraft_items = mission.hardware_items
        return jsonify({
            "mission_id": mission_id,
            "mission_name": mission.name,
            "count": len(spacecraft_items),
            "items": [sc.to_dict(full=False) for sc in spacecraft_items]
        }), 200
    except Exception as e:
        logger.error(f"Error fetching spacecraft for mission {mission_id}: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.route("/api/models", methods=["GET"])
def get_models_list():
    """Returns all 3D models in the database with their file references and spacecraft mapping."""
    db = SessionLocal()
    try:
        models = db.query(Model3D).options(joinedload(Model3D.spacecraft)).all()
        return jsonify({
            "count": len(models),
            "models": [m.to_dict() for m in models]
        }), 200
    except Exception as e:
        logger.error(f"Error fetching 3D models: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.route("/api/models/<model_name>", methods=["GET"])
def get_model_detail(model_name):
    """Returns details for a specific 3D model."""
    db = SessionLocal()
    try:
        model = db.query(Model3D).filter(Model3D.model_name == model_name.lower()).first()
        if not model:
            return jsonify({"error": f"3D Model '{model_name}' not found"}), 404
        return jsonify(model.to_dict()), 200
    except Exception as e:
        logger.error(f"Error fetching model '{model_name}': {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.route("/api/models/<model_name>/<filename>", methods=["GET"])
def serve_model_file(model_name, filename):
    """Serve physical 3D model asset directly from the models directory."""
    if not MODELS_BASE_DIR:
        return jsonify({"error": "Models directory not configured"}), 500
    
    target_dir = os.path.join(MODELS_BASE_DIR, model_name)
    if not os.path.exists(target_dir):
        return jsonify({"error": f"Model directory '{model_name}' not found"}), 404

    return send_from_directory(target_dir, filename)


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


def run():
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    print(f"Starting Novaquest Backend on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=debug)


if __name__ == "__main__":
    run()
