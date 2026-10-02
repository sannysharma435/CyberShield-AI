from fastapi import APIRouter, Header, Query

from database.database import get_recent_scans

router = APIRouter(
    prefix="/api/scans",
    tags=["Scan History"]
)


@router.get("/recent")
def recent_scans(
    limit: int = Query(default=20, ge=1, le=100),
    user_id: str | None = Header(
        default=None,
        alias="X-User-ID"
    )
):
    if not user_id:
        return {
            "count": 0,
            "scans": []
        }

    scans = get_recent_scans(
        user_id=user_id,
        limit=limit
    )

    return {
        "count": len(scans),
        "scans": scans
    }