import os
import csv
import sys
import argparse
from urllib.parse import urlparse
from dotenv import load_dotenv

# Load environment variables from .env file
# This looks for .env in the current directory or parents
load_dotenv()

def get_db_connection():
    """
    Establishes a database connection based on the DATABASE_URL env var.
    Supports PostgreSQL (standard for Prisma) and SQLite (often used locally).
    """
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("Error: DATABASE_URL not found in environment variables.")
        print("Make sure you have a .env file in your project root.")
        sys.exit(1)

    parsed = urlparse(database_url)
    
    # Handle PostgreSQL
    if parsed.scheme in ('postgres', 'postgresql'):
        try:
            import psycopg2
        except ImportError:
            print("Error: psycopg2 is required for PostgreSQL.")
            print("Run: pip install psycopg2-binary")
            sys.exit(1)
            
        conn = psycopg2.connect(
            dbname=parsed.path[1:],
            user=parsed.username,
            password=parsed.password,
            host=parsed.hostname,
            port=parsed.port or 5432
        )
        return conn, "postgres"
    
    # Handle SQLite
    elif parsed.scheme == 'file':
        try:
            import sqlite3
        except ImportError:
            print("Error: sqlite3 module not found.")
            sys.exit(1)
            
        # Handle relative paths in DATABASE_URL (e.g., file:./dev.db)
        db_path = parsed.path
        conn = sqlite3.connect(db_path)
        return conn, "sqlite"
    
    else:
        print(f"Error: Unsupported database scheme '{parsed.scheme}'.")
        sys.exit(1)

def export_data(output_file):
    conn, db_type = get_db_connection()
    cursor = conn.cursor()
    
    print(f"Connected to {db_type} database.")
    print(f"Exporting data to {output_file}...")

    # Prisma default table naming convention is PascalCase ("User", "CandidateProfile")
    # We use quotes to ensure case-sensitivity in PostgreSQL.
    
    queries = [
        {
            "role": "Candidate",
            "sql": """
                SELECT u.email, 'Candidate' as role
                FROM "User" u
                JOIN "CandidateProfile" cp ON u.id = cp."userId"
            """
        },
        {
            "role": "Recruiter",
            "sql": """
                SELECT u.email, 'Recruiter' as role
                FROM "User" u
                JOIN "RecruiterProfile" rp ON u.id = rp."userId"
            """
        }
    ]

    try:
        with open(output_file, mode='w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['Email', 'Role'])
            
            for q in queries:
                print(f"Fetching {q['role']}s...")
                try:
                    cursor.execute(q['sql'])
                    
                    # Fetch in batches to be memory efficient (Scalable)
                    while True:
                        rows = cursor.fetchmany(1000)
                        if not rows:
                            break
                        writer.writerows(rows)
                        
                except Exception as e:
                    print(f"Warning: Failed to fetch {q['role']}s. Error: {e}")

        print(" Export completed successfully.")

    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export Candidate and Recruiter emails to CSV.")
    parser.add_argument("-o", "--output", default="users_export.csv", help="Output CSV filename")
    args = parser.parse_args()
    
    export_data(args.output)