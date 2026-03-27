import asyncio
import uuid
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from models.schemas import ConvertResponse
from services.converter import (
    SUPPORTED_FORMATS,
    VALID_TEMPLATES,
    convert_document,
    convert_document_v2,
)
from utils.file_handler import cleanup_old_jobs, get_output_dir, save_upload

router = APIRouter(prefix="/api", tags=["convert"])


# ── v1 ─────────────────────────────────────────────────────────────────────────


@router.post("/convert", response_model=ConvertResponse)
async def convert_pdf(
    file: UploadFile = File(...),
    template: str = Form(default="report"),
) -> ConvertResponse:
    """Upload a PDF and convert it to LaTeX using the selected template."""
    try:
        job_id, pdf_path = await save_upload(file)
    except ValueError as e:
        return ConvertResponse(success=False, error=str(e))

    output_dir = get_output_dir(job_id)
    try:
        result = await convert_document(pdf_path, template, output_dir, job_id)
    except ValueError as e:
        return ConvertResponse(success=False, error=str(e))

    return result


@router.get("/files/{job_id}/{filename}")
async def serve_file_v1(job_id: str, filename: str):
    """Serve generated v1 .tex or .pdf files."""
    file_path = Path(f"/tmp/docstream/{job_id}/output/{filename}")
    if not file_path.exists():
        return ConvertResponse(success=False, error="File not found.")
    media_type = (
        "application/pdf" if filename.endswith(".pdf") else "text/plain"
    )
    return FileResponse(path=file_path, filename=filename, media_type=media_type)


# ── v2 ─────────────────────────────────────────────────────────────────────────


@router.post("/v2/convert", response_model=ConvertResponse)
async def convert_v2(
    file: UploadFile = File(...),
    template: str = Form(default="report"),
) -> ConvertResponse:
    """v2 conversion endpoint.

    Accepts PDF, DOCX, PPTX, images, Markdown, and plain text.
    Runs the full semantic pipeline:
      extract → analyze → match → render → quality check
    """
    job_id = str(uuid.uuid4())

    # Create job directories
    job_dir = Path(f"/tmp/docstream/{job_id}")
    input_dir = job_dir / "input"
    output_dir = job_dir / "output"
    input_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Validate file extension
    filename = file.filename or "document"
    ext = Path(filename).suffix.lower()
    if ext not in SUPPORTED_FORMATS:
        return ConvertResponse(
            success=False,
            job_id=job_id,
            error=(
                f"Unsupported format: {ext}. "
                f"Supported: {', '.join(sorted(SUPPORTED_FORMATS))}"
            ),
        )

    # Validate template (renderer supports report / ieee / resume)
    valid = VALID_TEMPLATES | {"altacv", "moderncv"}
    if template not in valid:
        return ConvertResponse(
            success=False,
            job_id=job_id,
            error=(
                f"Unknown template: {template}. "
                f"Valid: {', '.join(sorted(valid))}"
            ),
        )

    # Save uploaded file
    content = await file.read()

    # Validate file size (max 20 MB)
    file_size_mb = len(content) / (1024 * 1024)
    if file_size_mb > 20:
        return ConvertResponse(
            success=False,
            job_id=job_id,
            error=f"File too large: {file_size_mb:.1f} MB. Maximum is 20 MB.",
        )

    file_path = input_dir / filename
    file_path.write_bytes(content)

    # Kick off background cleanup (don't await — fire-and-forget)
    asyncio.create_task(asyncio.to_thread(cleanup_old_jobs))

    # Run the full v2 pipeline
    return await convert_document_v2(file_path, template, job_id, output_dir)


@router.get("/v2/files/{job_id}/{filename}")
async def serve_file_v2(job_id: str, filename: str):
    """Serve generated v2 .tex or .pdf files."""
    # Block path traversal
    if "/" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename.")

    file_path = Path(f"/tmp/docstream/{job_id}/output/{filename}")
    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"File not found: {filename}",
        )

    media_type = (
        "application/pdf" if filename.endswith(".pdf") else "text/plain"
    )
    return FileResponse(path=str(file_path), media_type=media_type, filename=filename)


@router.get("/v2/preview/{job_id}")
async def get_preview(job_id: str):
    """Serve the compiled PDF for browser preview with CORS headers."""
    pdf_path = Path(f"/tmp/docstream/{job_id}/output/document.pdf")
    if not pdf_path.exists():
        raise HTTPException(
            status_code=404,
            detail=(
                f"Preview not found for job {job_id}. "
                "The conversion may have failed or expired."
            ),
        )
    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename="document.pdf",
        headers={
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache",
        },
    )


@router.get("/v2/formats")
async def list_formats() -> dict:
    """Return all supported input formats for v2 conversion."""
    return {
        "formats": [
            {"extension": ".pdf",  "name": "PDF Document",   "icon": "file-text"},
            {"extension": ".docx", "name": "Word Document",  "icon": "file-word"},
            {"extension": ".pptx", "name": "PowerPoint",     "icon": "presentation"},
            {"extension": ".png",  "name": "PNG Image",      "icon": "image"},
            {"extension": ".jpg",  "name": "JPEG Image",     "icon": "image"},
            {"extension": ".md",   "name": "Markdown",       "icon": "file-code"},
            {"extension": ".txt",  "name": "Plain Text",     "icon": "file"},
        ]
    }
