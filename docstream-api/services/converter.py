import asyncio
from pathlib import Path

import docstream

from models.schemas import ConvertResponse


VALID_TEMPLATES = {"report", "ieee", "resume"}


async def convert_document(
    pdf_path: Path,
    template: str,
    output_dir: Path,
    job_id: str,
) -> ConvertResponse:
    """Run docstream conversion in a thread pool and return a clean response."""

    # Validate template
    if template not in VALID_TEMPLATES:
        raise ValueError(f"Unknown template: {template}")

    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: docstream.convert(
                str(pdf_path),
                template=template,
                output_dir=str(output_dir),
            ),
        )

        return ConvertResponse(
            success=True,
            tex_url=f"/api/files/{job_id}/document.tex",
            pdf_url=f"/api/files/{job_id}/document.pdf",
            processing_time=result.processing_time_seconds,
        )

    except docstream.ExtractionError:
        return ConvertResponse(
            success=False,
            error=(
                "Could not extract content from this PDF. "
                "Is it a valid, non-password-protected PDF?"
            ),
        )
    except docstream.StructuringError:
        return ConvertResponse(
            success=False,
            error=(
                "AI service temporarily unavailable. "
                "Please try again in a moment."
            ),
        )
    except docstream.RenderingError:
        return ConvertResponse(
            success=False,
            error=(
                "LaTeX rendering failed. The document structure "
                "may be too complex."
            ),
        )
    except Exception:
        return ConvertResponse(
            success=False,
            error="Conversion failed. Please try again.",
        )
