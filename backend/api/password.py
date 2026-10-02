from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

from scanners.password_checker.scanner import check_password
from database.database import save_scan

router = APIRouter(
    prefix="/api/password",
    tags=["Password Checker"]
)


class PasswordRequest(BaseModel):
    password: str


@router.post("/check")
def check(
    request: PasswordRequest,
    user_id: str | None = Header(
        default=None,
        alias="X-User-ID"
    )
):
    if not request.password:
        raise HTTPException(
            status_code=400,
            detail="Password is required"
        )

    result = check_password(request.password)

    save_scan(
        scan_type="password",
        target="password strength check",
        status=result.get("status", "unknown"),
        risk_score=100 - result.get("score", 0),
        indicators=", ".join(
            result.get("indicators", [])
        ),
        user_id=user_id
    )

    return result