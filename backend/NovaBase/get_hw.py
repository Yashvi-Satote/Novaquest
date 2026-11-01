import sqlite3
c = sqlite3.connect('D:/cosmic timekeepers/backend/space_hardware.db')
cur = c.cursor()
cur.execute('SELECT id, name, mission_id, destination, object_type, operational_status FROM hardware ORDER BY mission_id, name')
for r in cur.fetchall():
    print(r)
c.close()
