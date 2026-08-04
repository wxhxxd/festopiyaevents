import sqlite3

def alter_db():
    conn = sqlite3.connect('events.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('ALTER TABLE stall_bookings ADD COLUMN total_amount FLOAT DEFAULT 0.0')
        print("Added total_amount")
    except sqlite3.OperationalError as e:
        print("total_amount error:", e)
        
    try:
        cursor.execute('ALTER TABLE stall_bookings ADD COLUMN amount_paid FLOAT DEFAULT 0.0')
        print("Added amount_paid")
    except sqlite3.OperationalError as e:
        print("amount_paid error:", e)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    alter_db()
