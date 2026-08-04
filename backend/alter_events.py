import sqlite3

def alter_db():
    conn = sqlite3.connect('events.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('ALTER TABLE events ADD COLUMN provides_infrastructure BOOLEAN DEFAULT 1')
        print("Added provides_infrastructure")
    except sqlite3.OperationalError as e:
        print("provides_infrastructure error:", e)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    alter_db()
