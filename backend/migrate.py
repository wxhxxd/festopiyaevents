"""
One-time migration: adds is_verified and verification_token columns to users table.
Existing users are set to is_verified=1 so they can still log in without re-verifying.
Run once then delete this file.
"""
import sqlite3

conn = sqlite3.connect("events.db")
cur = conn.cursor()

cur.execute("PRAGMA table_info(users)")
existing_cols = [row[1] for row in cur.fetchall()]
print("Existing columns:", existing_cols)

if "is_verified" not in existing_cols:
    cur.execute("ALTER TABLE users ADD COLUMN is_verified INTEGER NOT NULL DEFAULT 1")
    print("ADDED: is_verified (all existing users set to verified=1)")
else:
    print("SKIPPED: is_verified already exists")

if "verification_token" not in existing_cols:
    cur.execute("ALTER TABLE users ADD COLUMN verification_token TEXT")
    print("ADDED: verification_token")
else:
    print("SKIPPED: verification_token already exists")

conn.commit()
conn.close()
print("Migration complete! You can delete migrate.py now.")
