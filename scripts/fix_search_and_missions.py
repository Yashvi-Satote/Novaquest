app_path = r"c:\Users\mitro\project\NQ\Novaquest\backend\NovaBase\app.py"
with open(app_path, "r", encoding="utf-8") as f:
    text = f.read()

# Replace primary_mission.has in search
text = text.replace(
    'Spacecraft.primary_mission.has(Mission.name.ilike(search_pattern)),\n',
    ''
)
text = text.replace(
    'Spacecraft.primary_mission.has(Mission.name.ilike(mission_name)),\n',
    ''
)

# Replace operator_id, mission_agency_id, manufacturer_id
old_org_filter = '''    # 5. Organization filter
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
        )'''

new_org_filter = '''    # 5. Organization filter
    org_name = params.get("organization", "").strip()
    if org_name and org_name.lower() != "all":
        query = query.filter(
            or_(
                Spacecraft.agency.ilike(f"%{org_name}%"),
                Spacecraft.manufacturer.ilike(f"%{org_name}%")
            )
        )'''

text = text.replace(old_org_filter, new_org_filter)

# In get_mission_detail and get_mission_spacecraft, support identifier as int or slug
old_gmd = '''@app.route("/api/missions/<int:mission_id>", methods=["GET"])
def get_mission_detail(mission_id):'''

new_gmd = '''@app.route("/api/missions/<identifier>", methods=["GET"])
def get_mission_detail(identifier):
    db = SessionLocal()
    try:
        query = db.query(Mission).options(
            selectinload(Mission.spacecraft_items).joinedload(Spacecraft.model_3d)
        )
        if str(identifier).isdigit():
            mission = query.filter(Mission.id == int(identifier)).first()
        else:
            mission = query.filter(or_(Mission.slug == identifier.lower(), Mission.mission_name.ilike(identifier))).first()

        if not mission:
            return jsonify({"error": f"Mission '{identifier}' not found"}), 404

        data = mission.to_dict(include_hardware_count=True, include_spacecraft=True)
        return jsonify(data), 200
    except Exception as e:
        logger.error(f"Error fetching mission detail for {identifier}: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


def _unused_get_mission_detail(mission_id):'''

text = text.replace(old_gmd, new_gmd)

old_gms = '''@app.route("/api/missions/<int:mission_id>/hardware", methods=["GET"])
@app.route("/api/missions/<int:mission_id>/spacecraft", methods=["GET"])
def get_mission_spacecraft(mission_id):'''

new_gms = '''@app.route("/api/missions/<identifier>/hardware", methods=["GET"])
@app.route("/api/missions/<identifier>/spacecraft", methods=["GET"])
def get_mission_spacecraft(identifier):
    db = SessionLocal()
    try:
        query = db.query(Mission).options(
            selectinload(Mission.spacecraft_items).joinedload(Spacecraft.model_3d)
        )
        if str(identifier).isdigit():
            mission = query.filter(Mission.id == int(identifier)).first()
        else:
            mission = query.filter(or_(Mission.slug == identifier.lower(), Mission.mission_name.ilike(identifier))).first()

        if not mission:
            return jsonify({"error": f"Mission '{identifier}' not found"}), 404

        spacecraft_items = mission.spacecraft_items
        return jsonify({
            "mission_id": mission.id,
            "mission_name": mission.mission_name or mission.name,
            "count": len(spacecraft_items),
            "items": [sc.to_dict(full=False) for sc in spacecraft_items]
        }), 200
    except Exception as e:
        logger.error(f"Error fetching spacecraft for mission {identifier}: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


def _unused_get_mission_spacecraft(mission_id):'''

text = text.replace(old_gms, new_gms)

with open(app_path, "w", encoding="utf-8") as f:
    f.write(text)

print("build_spacecraft_query and mission handlers updated!")

