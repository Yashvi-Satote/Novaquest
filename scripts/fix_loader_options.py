app_path = r"c:\Users\mitro\project\NQ\Novaquest\backend\NovaBase\app.py"
with open(app_path, "r", encoding="utf-8") as f:
    text = f.read()

# Fix joinedloads in get_filters
old_gf_options = '''        records = db.query(Spacecraft).options(
            joinedload(Spacecraft.primary_mission),
            joinedload(Spacecraft.missions),
            joinedload(Spacecraft.operator),
            joinedload(Spacecraft.mission_agency),
            joinedload(Spacecraft.manufacturer),
            joinedload(Spacecraft.model_3d)
        ).all()'''
new_gf_options = '''        records = db.query(Spacecraft).options(
            joinedload(Spacecraft.missions),
            joinedload(Spacecraft.model_3d)
        ).all()'''
text = text.replace(old_gf_options, new_gf_options)

# Fix joinedloads in build_spacecraft_query
old_bsq_options = '''    query = db.query(Spacecraft).options(
        joinedload(Spacecraft.primary_mission),
        joinedload(Spacecraft.missions),
        joinedload(Spacecraft.operator),
        joinedload(Spacecraft.mission_agency),
        joinedload(Spacecraft.manufacturer),
        joinedload(Spacecraft.model_3d),
        joinedload(Spacecraft.images)
    )'''
new_bsq_options = '''    query = db.query(Spacecraft).options(
        joinedload(Spacecraft.missions),
        joinedload(Spacecraft.model_3d),
        joinedload(Spacecraft.images)
    )'''
text = text.replace(old_bsq_options, new_bsq_options)

# Fix joinedloads in get_spacecraft_detail
old_gsd_options = '''        query = db.query(Spacecraft).options(
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
        )'''
new_gsd_options = '''        query = db.query(Spacecraft).options(
            joinedload(Spacecraft.missions),
            joinedload(Spacecraft.model_3d),
            joinedload(Spacecraft.aliases),
            joinedload(Spacecraft.keywords),
            joinedload(Spacecraft.images),
            joinedload(Spacecraft.sources)
        )'''
text = text.replace(old_gsd_options, new_gsd_options)

# In get_filters, replace sc.operator.name with sc.agency or sc.manufacturer
old_org_extract = '''            org_name = (
                sc.operator.name if sc.operator else
                (sc.mission_agency.name if sc.mission_agency else
                (sc.manufacturer.name if sc.manufacturer else "NASA"))
            )'''
new_org_extract = '''            org_name = sc.agency or sc.manufacturer or "NASA"'''
text = text.replace(old_org_extract, new_org_extract)

# In get_filters, active_mission = sc.primary_mission
old_sc_m = '''            active_mission = sc.mission'''
new_sc_m = '''            active_mission = sc.primary_mission'''
text = text.replace(old_sc_m, new_sc_m)

# In get_missions and get_mission_detail, update options
old_gm_options = '''        query = db.query(Mission).options(
            selectinload(Mission.spacecraft_items),
            selectinload(Mission.primary_spacecraft_items)
        )'''
new_gm_options = '''        query = db.query(Mission).options(
            selectinload(Mission.spacecraft_items)
        )'''
text = text.replace(old_gm_options, new_gm_options)

old_gmd_options = '''        mission = db.query(Mission).options(
            selectinload(Mission.spacecraft_items).joinedload(Spacecraft.model_3d),
            selectinload(Mission.primary_spacecraft_items).joinedload(Spacecraft.model_3d)
        ).filter(Mission.id == mission_id).first()'''
new_gmd_options = '''        mission = db.query(Mission).options(
            selectinload(Mission.spacecraft_items).joinedload(Spacecraft.model_3d)
        ).filter(Mission.id == mission_id).first()'''
text = text.replace(old_gmd_options, new_gmd_options)

with open(app_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Options updated successfully!")

