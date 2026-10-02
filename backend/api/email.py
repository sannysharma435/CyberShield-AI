from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

from scanners.email_scanner.scanner import scan_email
from database.database import save_scan

router = APIRouter(
    prefix="/api/email",
    tags=["Email Scanner"]
)


class EmailRequest(BaseModel):
    email: str


@router.post("/scan")
def scan(
    request: EmailRequest,
    user_id: str | None = Header(
        default=None,
        alias="X-User-ID"
    )
):
    if not request.email.strip():
        raise HTTPException(
            status_code=400,
            detail="Email content is required"
        )

    result = scan_email(request.email)

    save_scan(
        scan_type="email",
        target="email content",
        status=result.get("status", "unknown"),
        risk_score=result.get("risk_score", 0),
        indicators=", ".join(
            result.get("indicators", [])
        ),
        user_id=user_id
    )

    return result