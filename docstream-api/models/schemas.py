from pydantic import BaseModel


class ConvertResponse(BaseModel):
    success: bool
    tex_url: str | None = None
    pdf_url: str | None = None
    processing_time: float | None = None
    error: str | None = None


class HealthResponse(BaseModel):
    status: str
    version: str
