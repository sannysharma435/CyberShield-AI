import hashlib
from pathlib import Path

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".mp4",
    ".mov",
    ".avi",
    ".pdf",
    ".txt"
}

MAX_FILE_SIZE = 25 * 1024 * 1024


def analyze_file(filename: str, content: bytes):
    extension = Path(filename).suffix.lower()
    file_size = len(content)

    indicators = []

    if not extension:
        return {
            "status": "suspicious",
            "risk_score": 60,
            "reason": "File has no extension",
            "indicators": ["Missing file extension"]
        }

    if extension not in ALLOWED_EXTENSIONS:
        return {
            "status": "suspicious",
            "risk_score": 70,
            "reason": f"File type {extension} is not currently supported",
            "indicators": ["Unsupported file type"]
        }

    if file_size > MAX_FILE_SIZE:
        return {
            "status": "suspicious",
            "risk_score": 80,
            "reason": "File exceeds the 25 MB upload limit",
            "indicators": ["File size exceeds 25 MB"]
        }

    file_hash = hashlib.sha256(content).hexdigest()

    return {
        "status": "safe",
        "risk_score": 5,
        "reason": "File passed preliminary security checks",
        "indicators": indicators,
        "file_hash": file_hash,
        "file_size": file_size,
        "extension": extension
    }