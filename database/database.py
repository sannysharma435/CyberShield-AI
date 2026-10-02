import sqlite3
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATABASE_PATH = DATA_DIR / "cybershield.db"

DATA_DIR.mkdir(parents=True, exist_ok=True)


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            scan_type TEXT NOT NULL,
            target TEXT NOT NULL,
            status TEXT NOT NULL,
            risk_score INTEGER DEFAULT 0,
            indicators TEXT,
            file_hash TEXT,
            cloudinary_url TEXT,
            created_at TEXT NOT NULL
        )
    """)

    columns = connection.execute(
        "PRAGMA table_info(scans)"
    ).fetchall()

    column_names = [column["name"] for column in columns]

    if "user_id" not in column_names:
        connection.execute(
            "ALTER TABLE scans ADD COLUMN user_id TEXT"
        )

    connection.commit()
    connection.close()


def save_scan(
    scan_type,
    target,
    status,
    risk_score=0,
    indicators="",
    file_hash=None,
    cloudinary_url=None,
    user_id=None
):
    if not user_id:
        return

    connection = get_connection()

    connection.execute(
        """
        INSERT INTO scans (
            user_id,
            scan_type,
            target,
            status,
            risk_score,
            indicators,
            file_hash,
            cloudinary_url,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            scan_type,
            target,
            status,
            risk_score,
            indicators,
            file_hash,
            cloudinary_url,
            datetime.now().isoformat()
        )
    )

    connection.commit()
    connection.close()


def get_recent_scans(user_id, limit=20):
    if not user_id:
        return []

    connection = get_connection()

    rows = connection.execute(
        """
        SELECT *
        FROM scans
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT ?
        """,
        (user_id, limit)
    ).fetchall()

    connection.close()

    return [dict(row) for row in rows]


initialize_database()