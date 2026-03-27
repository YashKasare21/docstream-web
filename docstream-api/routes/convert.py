from pathlib import Path

from fastapi import APIRouter, Form, HTTPException, UploadFile, File
from fastapi.responses import FileResponse

from models.schemas import ConvertResponse
from services.converter import convert_document
from utils.file_handler import save_upload, get_output_dir


router = APIRouter(prefix="/api", tags=["convert"])


@router.post("/convert", response_model=ConvertResponse)
async def convert_pdf(
    file: UploadFile = File(...),
    template: str = Form(default="report"),
) -> ConvertResponse:
    """Upload a PDF and convert it to LaTeX using the selected template."""

    # Save and validate the upload
    try:
        job_id, pdf_path = await save_upload(file)
    except ValueError as e:
        return ConvertResponse(success=False, error=str(e))

    # Run conversion
    output_dir = get_output_dir(job_id)

    try:
        result = await convert_document(pdf_path, template, output_dir, job_id)
    except ValueError as e:
        return ConvertResponse(success=False, error=str(e))

    return result


@router.get("/files/{job_id}/{filename}")
async def serve_file(job_id: str, filename: str):
    """Serve generated .tex or .pdf files."""
    file_path = Path(f"/tmp/docstream/{job_id}/output/{filename}")

    if not file_path.exists():
        return ConvertResponse(success=False, error="File not found.")

    media_type = (
        "application/pdf" if filename.endswith(".pdf") else "text/plain"
    )
    return FileResponse(path=file_path, filename=filename, media_type=media_type)


# ── v2 endpoints ──────────────────────────────────────────────────────────────


@router.post("/v2/convert")
async def convert_v2(
    file: UploadFile = File(...),
    template: str = Form(default="report"),
) -> dict:
    """v2 conversion endpoint.

    Accepts any supported format (PDF, DOCX, PPTX, images, MD, TXT).
    Returns a ``job_id`` for status polling.

    Raises:
        HTTPException: 501 Not Implemented — pending Phase 8.
    """
    raise HTTPException(status_code=501, detail="v2 conversion not yet implemented.")


@router.get("/v2/preview/{job_id}")
async def get_preview(job_id: str):
    """Serve the compiled PDF for browser preview.

    Args:
        job_id: Identifier returned by ``POST /api/v2/convert``.

    Returns:
        The PDF file directly with headers that allow PDF.js cross-origin access.
    """
    import os

    pdf_path = f"/tmp/docstream/{job_id}/output/document.pdf"

    if not os.path.exists(pdf_path):
        raise HTTPException(
            status_code=404,
            detail=(
                f"Preview not found for job {job_id}. "
                "The conversion may have failed or expired."
            ),
        )

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename="document.pdf",
        headers={
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache",
        },
    )


@router.post("/v2/feedback")
async def submit_feedback(
    job_id: str = Form(...),
    emoji_rating: str = Form(...),
    comment: str = Form(default=""),
) -> dict:
    """Store user feedback for a conversion job.

    Body fields:
        job_id: Conversion job to attach feedback to.
        emoji_rating: One of 😞 😐 😊 😄 🤩.
        comment: Optional free-text comment (max 500 chars).

    Raises:
        HTTPException: 501 Not Implemented — pending Phase 14.
    """
    raise HTTPException(status_code=501, detail="Feedback submission not yet implemented.")


@router.get("/v2/formats")
async def list_formats() -> dict:
    """Return all supported input formats for v2 conversion."""
    return {
        "formats": [
            {"extension": ".pdf", "name": "PDF Document", "icon": "file-text"},
            {"extension": ".docx", "name": "Word Document", "icon": "file-word"},
            {"extension": ".pptx", "name": "PowerPoint", "icon": "presentation"},
            {"extension": ".png", "name": "PNG Image", "icon": "image"},
            {"extension": ".jpg", "name": "JPEG Image", "icon": "image"},
            {"extension": ".md", "name": "Markdown", "icon": "file-code"},
            {"extension": ".txt", "name": "Plain Text", "icon": "file"},
        ]
    }
