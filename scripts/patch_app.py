import os

app_path = r"c:\Users\mitro\project\NQ\Novaquest\backend\NovaBase\app.py"
with open(app_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
if "MapObject" not in content:
    content = content.replace(
        "from NovaBase.models import (\n    Mission,",
        "from NovaBase.models import (\n    Mission,\n    MapObject,\n    SpacecraftMission,"
    )

# 2. Update bootstrap_database
old_boot = '''def bootstrap_database():
    """Ensure the scalable database schema and complete 122 spacecraft records are present."""
    from NovaBase.migrate_and_import import run_migration_and_import

    try:
        run_migration_and_import()
    except Exception as e:
        logger.error(f"Database bootstrap failed: {e}")'''

new_boot = '''def bootstrap_database():
    """Ensure the scalable database schema and complete 122 spacecraft records are present."""
    db = SessionLocal()
    try:
        count = db.query(Spacecraft).count()
        if count == 0:
            logger.info("NovaBase database is empty. Running automatic ingestion...")
            from NovaBase.ingest_novabase import run_ingestion
            run_ingestion()
    except Exception as e:
        logger.warning(f"Database bootstrap notice: {e}. Running ingestion...")
        try:
            from NovaBase.ingest_novabase import run_ingestion
            run_ingestion()
        except Exception as ex:
            logger.error(f"Ingestion failed: {ex}")
    finally:
        db.close()'''

if old_boot in content:
    content = content.replace(old_boot, new_boot)

# 3. Add helper resolve_spacecraft and Phase 7 endpoints
endpoints_code = '''
def resolve_spacecraft(db, identifier):
    query = db.query(Spacecraft).options(
        joinedload(Spacecraft.missions),
        joinedload(Spacecraft.model_3d),
        joinedload(Spacecraft.aliases),
        joinedload(Spacecraft.images),
        joinedload(Spacecraft.sources)
    )
    sc = None
    if str(identifier).isdigit():
        sc = query.filter(Spacecraft.id == int(identifier)).first()
    if not sc:
        sc = query.filter(Spacecraft.slug == str(identifier).lower()).first()
    if not sc:
        sc = query.filter(Spacecraft.name == str(identifier).lower()).first()
    if not sc:
        alias_match = db.query(SpacecraftAlias).filter(SpacecraftAlias.alias.ilike(str(identifier))).first()
        if alias_match:
            sc = query.filter(Spacecraft.id == alias_match.spacecraft_id).first()
    return sc


@app.route("/api/spacecraft/<identifier>/missions", methods=["GET"])
@app.route("/api/hardware/<identifier>/missions", methods=["GET"])
def get_spacecraft_missions_endpoint(identifier):
    db = SessionLocal()
    try:
        sc = resolve_spacecraft(db, identifier)
        if not sc:
            return jsonify({"error": f"Spacecraft '{identifier}' not found"}), 404
        
        missions_data = [
            {
                "id": m.id,
                "mission_name": m.mission_name or m.name,
                "name": m.name or m.mission_name,
                "slug": m.slug,
                "agency": m.agency,
                "mission_type": m.mission_type,
                "launch_date": m.launch_date,
                "destination": m.destination,
                "mission_status": m.mission_status,
                "description": m.description
            }
            for m in sc.missions
        ]
        return jsonify({
            "spacecraft_id": sc.id,
            "spacecraft_name": sc.name,
            "count": len(missions_data),
            "missions": missions_data
        }), 200
    except Exception as e:
        logger.error(f"Error fetching missions for spacecraft {identifier}: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.route("/api/spacecraft/<identifier>/model", methods=["GET"])
@app.route("/api/hardware/<identifier>/model", methods=["GET"])
def get_spacecraft_model_endpoint(identifier):
    db = SessionLocal()
    try:
        sc = resolve_spacecraft(db, identifier)
        if not sc:
            return jsonify({"error": f"Spacecraft '{identifier}' not found"}), 404
        
        if sc.model_3d:
            return jsonify(sc.model_3d.to_dict()), 200
        elif sc.model_path:
            return jsonify({
                "spacecraft_id": sc.id,
                "model_name": sc.name,
                "primary_format": sc.model_format or "glb",
                "glb_path": sc.model_path,
                "is_available": True
            }), 200
        else:
            return jsonify({"error": f"No 3D model found for spacecraft '{identifier}'"}), 404
    except Exception as e:
        logger.error(f"Error fetching model for spacecraft {identifier}: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.route("/api/map/objects", methods=["GET"])
def get_map_objects():
    """
    Returns objects for the 3D Solar System map.
    Supports ?type=spacecraft, ?type=satellite, ?type=planet, ?type=moon, ?status=active, etc.
    """
    db = SessionLocal()
    try:
        obj_type = request.args.get("type", "").strip().lower()
        parent = request.args.get("parent", "").strip()
        status = request.args.get("status", "").strip().lower()
        search = request.args.get("q", "").strip().lower()

        query = db.query(MapObject).options(
            joinedload(MapObject.spacecraft).joinedload(Spacecraft.model_3d),
            joinedload(MapObject.mission)
        )

        if obj_type and obj_type != "all":
            if obj_type in ["spacecraft", "satellite", "space_telescope", "lander", "rover", "probe", "planet", "moon", "star"]:
                query = query.filter(func.lower(MapObject.object_type) == obj_type)
            else:
                query = query.filter(MapObject.object_type.ilike(f"%{obj_type}%"))

        if parent:
            query = query.filter(MapObject.parent_body.ilike(parent))

        if search:
            query = query.filter(
                or_(
                    MapObject.object_name.ilike(f"%{search}%"),
                    MapObject.parent_body.ilike(f"%{search}%")
                )
            )

        objects = query.all()
        results = []
        for obj in objects:
            data = obj.to_dict()
            if status and status != "all":
                craft_status = (obj.spacecraft.operational_status if obj.spacecraft else "").lower()
                if status not in craft_status:
                    continue
            results.append(data)

        return jsonify({
            "count": len(results),
            "objects": results
        }), 200
    except Exception as e:
        logger.error(f"Error fetching map objects: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@app.route("/api/map/filters", methods=["GET"])
def get_map_filters():
    """
    Returns dynamic filter categories, object counts, operational statuses, and missions.
    Powers Phase 8 working map filters.
    """
    db = SessionLocal()
    try:
        type_counts = dict(
            db.query(MapObject.object_type, func.count(MapObject.id))
            .group_by(MapObject.object_type)
            .all()
        )

        status_counts = dict(
            db.query(Spacecraft.operational_status, func.count(Spacecraft.id))
            .group_by(Spacecraft.operational_status)
            .all()
        )

        dest_counts = dict(
            db.query(Spacecraft.destination, func.count(Spacecraft.id))
            .group_by(Spacecraft.destination)
            .all()
        )

        missions = db.query(Mission).order_by(asc(Mission.mission_name)).all()

        total_objects = db.query(MapObject).count()
        total_spacecraft = db.query(Spacecraft).count()

        return jsonify({
            "total_objects": total_objects,
            "total_spacecraft": total_spacecraft,
            "object_types": [
                {"id": "planets", "label": "Planets", "type": "planet", "count": type_counts.get("planet", 0) + type_counts.get("star", 0)},
                {"id": "moons", "label": "Moons", "type": "moon", "count": type_counts.get("moon", 0)},
                {"id": "spacecraft", "label": "Spacecraft", "type": "spacecraft", "count": type_counts.get("spacecraft", 0)},
                {"id": "satellites", "label": "Satellites", "type": "satellite", "count": type_counts.get("satellite", 0)},
                {"id": "space_telescopes", "label": "Space Telescopes", "type": "space_telescope", "count": type_counts.get("space_telescope", 0)},
                {"id": "landers", "label": "Landers", "type": "lander", "count": type_counts.get("lander", 0)},
                {"id": "rovers", "label": "Rovers", "type": "rover", "count": type_counts.get("rover", 0)},
                {"id": "probes", "label": "Probes", "type": "probe", "count": type_counts.get("probe", 0)}
            ],
            "statuses": [
                {"id": "active", "label": "Active", "count": status_counts.get("Active", 0)},
                {"id": "completed", "label": "Completed", "count": status_counts.get("Completed", 0)},
                {"id": "inactive", "label": "Inactive", "count": status_counts.get("Inactive", 0)},
                {"id": "failed", "label": "Failed", "count": status_counts.get("Failed", 0)},
                {"id": "planned", "label": "Planned", "count": status_counts.get("Planned", 0)},
                {"id": "unknown", "label": "Unknown", "count": status_counts.get("Unknown", 0)}
            ],
            "destinations": [
                {"name": k, "count": v} for k, v in dest_counts.items() if k
            ],
            "missions": [
                {
                    "id": m.id,
                    "name": m.mission_name or m.name,
                    "slug": m.slug,
                    "destination": m.destination,
                    "status": m.mission_status,
                    "spacecraft_count": len(m.spacecraft_items)
                }
                for m in missions
            ]
        }), 200
    except Exception as e:
        logger.error(f"Error compiling map filters: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()
'''

if "/api/map/objects" not in content:
    content = content.replace("def run():", endpoints_code + "\ndef run():")

with open(app_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patching complete!")

