from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ConvertResponse(BaseModel):
    success: bool
    tex_url: str | None = None
    pdf_url: str | None = None
    processing_time: float | None = None
    error: str | None = None


class HealthResponse(BaseModel):
    status: str
    version: str


class FeedbackCreate(BaseModel):
    """Request body for POST /api/v2/feedback."""

    job_id: str
    emoji_rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    template_used: Optional[str] = None
    document_type: Optional[str] = None
    processing_time: Optional[float] = None


class FeedbackResponse(BaseModel):
    """Response for feedback submission."""

    success: bool
    message: str
    feedback_id: Optional[str] = None


class FeedbackStats(BaseModel):
    """Aggregated feedback statistics."""

    total_count: int
    average_rating: float
    rating_distribution: dict
    recent_comments: list[str]
