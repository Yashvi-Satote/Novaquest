import sqlite3
c = sqlite3.connect('D:/cosmic timekeepers/backend/space_hardware.db')
cur = c.cursor()
# check columns
cur.execute("PRAGMA table_info(missions)")
for r in cur.fetchall():
    print(r)
c.close()
