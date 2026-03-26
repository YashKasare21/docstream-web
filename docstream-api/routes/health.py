from fastapi import APIRouter

from models.schemas import HealthResponse


router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Return the current API health status."""
    return HealthResponse(status="ok", version="0.1.0")
