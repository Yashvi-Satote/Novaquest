import sqlite3
c = sqlite3.connect('D:/cosmic timekeepers/backend/space_hardware.db')
cur = c.cursor()
cur.execute("SELECT id, name, destination_category, mission_status FROM missions ORDER BY destination_category, name")
for r in cur.fetchall():
    print(r[0], r[1], r[2], r[3])
c.close()
