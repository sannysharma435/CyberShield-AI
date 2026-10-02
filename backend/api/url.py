from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

from scanners.url_scanner.scanner import scan_url
from database.database import save_scan

router = APIRouter(
    prefix="/api/url",
    tags=["URL Scanner"]
)


class URLRequest(BaseModel):
    url: str


@router.post("/scan")
def scan(
    request: URLRequest,
    user_id: str | None = Header(
        default=None,
        alias="X-User-ID"
    )
):
    if not request.url.strip():
        raise HTTPException(
            status_code=400,
            detail="URL is required"
        )

    result = scan_url(request.url)

    save_scan(
        scan_type="url",
        target=result.get("url", request.url),
        status=result.get("status", "unknown"),
        risk_score=result.get("risk_score", 0),
        indicators=", ".join(
            result.get("indicators", [])
        ),
        user_id=user_id
    )

    return result