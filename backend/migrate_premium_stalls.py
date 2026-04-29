import sqlite3

conn = sqlite3.connect('events.db')
cur = conn.cursor()

cur.execute('PRAGMA table_info(events)')
cols = [row[1] for row in cur.fetchall()]
print('Existing columns:', cols)

if 'premium_stall_ids' not in cols:
    cur.execute("ALTER TABLE events ADD COLUMN premium_stall_ids TEXT DEFAULT '[]'")
    print('Added premium_stall_ids column.')
else:
    print('premium_stall_ids already exists — skipping.')

conn.commit()
conn.close()
print('Migration complete.')
