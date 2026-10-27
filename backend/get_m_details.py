import sqlite3
c = sqlite3.connect('D:/cosmic timekeepers/backend/space_hardware.db')
cur = c.cursor()
cur.execute('SELECT * FROM missions WHERE id IN (3,10,11,25,27,57,7,8,9,56,2,20,24,1,22,13,33,35,15)')
for r in cur.fetchall():
    print(r)
c.close()
