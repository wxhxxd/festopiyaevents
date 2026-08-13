import sqlite3

def run_migration():
    conn = sqlite3.connect("events.db")
    cur = conn.cursor()

    cur.execute("PRAGMA table_info(stall_bookings)")
    existing_cols = [row[1] for row in cur.fetchall()]
    print("Existing columns in stall_bookings:", existing_cols)

    if "txnid" not in existing_cols:
        cur.execute("ALTER TABLE stall_bookings ADD COLUMN txnid TEXT")
        print("ADDED: txnid")
    else:
        print("SKIPPED: txnid already exists")

    if "status" not in existing_cols:
        cur.execute("ALTER TABLE stall_bookings ADD COLUMN status TEXT DEFAULT 'Pending'")
        print("ADDED: status")
    else:
        print("SKIPPED: status already exists")

    conn.commit()
    conn.close()
    print("Migration complete!")

if __name__ == "__main__":
    run_migration()
