import sqlite3

conn = sqlite3.connect("events.db")
cur = conn.cursor()

cur.execute("PRAGMA table_info(users)")
existing_cols = [row[1] for row in cur.fetchall()]
print("Existing columns:", existing_cols)

if "avatar_url" not in existing_cols:
    cur.execute("ALTER TABLE users ADD COLUMN avatar_url TEXT")
    print("ADDED: avatar_url column to users table")
else:
    print("SKIPPED: avatar_url already exists")

conn.commit()
conn.close()
print("Migration script executed successfully!")
