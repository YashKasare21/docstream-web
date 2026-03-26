from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form
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
