import os

import cloudinary
import cloudinary.uploader

from dotenv import load_dotenv
from fastapi import APIRouter, File, Header, HTTPException, UploadFile

from scanners.file_scanner.scanner import analyze_file
from database.database import save_scan

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

router = APIRouter(
    prefix="/api/media",
    tags=["Media Security"]
)


@router.post("/scan")
async def scan_media(
    file: UploadFile = File(...),
    user_id: str | None = Header(
        default=None,
        alias="X-User-ID"
    )
):
    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Empty file"
        )

    filename = file.filename or "unknown"

    analysis = analyze_file(
        filename,
        content
    )

    if analysis["status"] == "suspicious":
        save_scan(
            scan_type="file",
            target=filename,
            status=analysis["status"],
            risk_score=analysis["risk_score"],
            indicators=", ".join(
                analysis.get("indicators", [])
            ),
            file_hash=analysis.get("file_hash"),
            user_id=user_id
        )

        return {
            "filename": filename,
            "analysis": analysis,
            "cloudinary": None,
            "message": "File was not uploaded because preliminary checks detected a risk"
        }

    try:
        result = cloudinary.uploader.upload(
            content,
            folder="cybershield/media",
            resource_type="auto"
        )

        cloudinary_url = result.get("secure_url")

        save_scan(
            scan_type="file",
            target=filename,
            status=analysis.get("status", "safe"),
            risk_score=analysis.get("risk_score", 0),
            indicators=", ".join(
                analysis.get("indicators", [])
            ),
            file_hash=analysis.get("file_hash"),
            cloudinary_url=cloudinary_url,
            user_id=user_id
        )

        return {
            "filename": filename,
            "content_type": file.content_type,
            "analysis": analysis,
            "cloudinary": {
                "public_id": result.get("public_id"),
                "resource_type": result.get("resource_type"),
                "format": result.get("format"),
                "url": cloudinary_url
            },
            "message": "Media uploaded and preliminary security scan completed"
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Cloudinary upload failed: {str(error)}"
        )