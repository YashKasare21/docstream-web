import asyncio
import logging
import time
from pathlib import Path

import docstream
from docstream.core.renderer import DocumentRenderer
from docstream.exceptions import RenderingError, TemplateError
from docstream.models.document import (
    DocumentAST,
    DocumentMetadata,
    Section,
    SemanticDocument,
    TemplateData,
)

from models.schemas import ConvertResponse

logger = logging.getLogger(__name__)

VALID_TEMPLATES = {"report", "ieee", "resume"}
SUPPORTED_FORMATS = [
    ".pdf", ".docx", ".pptx",
    ".png", ".jpg", ".jpeg",
    ".md", ".txt",
]

# Section field names to convert into document sections
_SECTION_FIELDS = [
    "introduction", "body", "methodology", "results",
    "discussion", "conclusion", "references",
    "experience", "work_experience", "education",
    "skills", "projects", "summary",
]


async def convert_document(
    pdf_path: Path,
    template: str,
    output_dir: Path,
    job_id: str,
) -> ConvertResponse:
    """Run the legacy v1 docstream conversion (PDF → LaTeX) in a thread pool."""
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
            job_id=job_id,
            tex_url=f"/api/files/{job_id}/document.tex",
            pdf_url=f"/api/files/{job_id}/document.pdf",
            processing_time=result.processing_time_seconds,
        )

    except docstream.ExtractionError:
        return ConvertResponse(
            success=False,
            job_id=job_id,
            error=(
                "Could not extract content from this PDF. "
                "Is it a valid, non-password-protected PDF?"
            ),
        )
    except docstream.StructuringError:
        return ConvertResponse(
            success=False,
            job_id=job_id,
            error=(
                "AI service temporarily unavailable. "
                "Please try again in a moment."
            ),
        )
    except docstream.RenderingError:
        return ConvertResponse(
            success=False,
            job_id=job_id,
            error=(
                "LaTeX rendering failed. The document structure "
                "may be too complex."
            ),
        )
    except Exception:
        return ConvertResponse(
            success=False,
            job_id=job_id,
            error="Conversion failed. Please try again.",
        )


async def convert_document_v2(
    file_path: Path,
    template: str,
    job_id: str,
    output_dir: Path,
) -> ConvertResponse:
    """Full v2 conversion pipeline.

    Stages:
    1. Extract  — format router → List[Block]
    2. Analyze  — semantic analyzer → SemanticDocument
    3. Match    — template matcher → TemplateData
    4. Render   — LaTeX generation via DocumentRenderer
    5. Check    — static quality analysis → QualityReport
    """
    start_time = time.time()
    quality_score: float | None = None

    try:
        loop = asyncio.get_event_loop()

        # ── Stage 1: Extract ─────────────────────────────────────────────────
        logger.info("[%s] Stage 1: Extracting from %s", job_id, file_path.name)
        blocks = await loop.run_in_executor(
            None, lambda: docstream.extract(str(file_path))
        )
        logger.info("[%s] Extracted %d blocks", job_id, len(blocks))

        # ── Stage 2: Analyze ─────────────────────────────────────────────────
        logger.info("[%s] Stage 2: Semantic analysis", job_id)
        semantic_doc = await loop.run_in_executor(
            None, lambda: docstream.analyze(blocks)
        )
        logger.info(
            "[%s] Document type: %s (confidence %.2f)",
            job_id,
            semantic_doc.document_type,
            semantic_doc.confidence,
        )

        # ── Stage 3: Match template ──────────────────────────────────────────
        logger.info("[%s] Stage 3: Template matching → %s", job_id, template)
        template_data = await loop.run_in_executor(
            None, lambda: docstream.match_template(semantic_doc, template)
        )
        if template_data.missing_required:
            logger.warning(
                "[%s] Missing required fields: %s",
                job_id,
                template_data.missing_required,
            )

        # ── Stage 4: Build DocumentAST and render LaTeX ──────────────────────
        logger.info("[%s] Stage 4: Rendering LaTeX", job_id)
        ast = _template_data_to_ast(semantic_doc, template_data)
        renderer = DocumentRenderer(template=template)
        render_result = await loop.run_in_executor(
            None, lambda: renderer.render(ast, output_dir)
        )

        if not render_result.success:
            raise RenderingError(render_result.error or "LaTeX rendering failed")

        # ── Stage 5: Static quality check ────────────────────────────────────
        if render_result.tex_path and render_result.tex_path.exists():
            logger.info("[%s] Stage 5: Quality check", job_id)
            latex_content = render_result.tex_path.read_text(encoding="utf-8")
            quality_report = await loop.run_in_executor(
                None,
                lambda: docstream.check_quality(
                    latex_content, template, skip_compilation=True
                ),
            )
            quality_score = round(quality_report.overall_score, 3)
            if not quality_report.passed:
                logger.warning(
                    "[%s] Quality warnings: %s",
                    job_id,
                    quality_report.warnings[:3],
                )

        processing_time = round(time.time() - start_time, 1)
        logger.info("[%s] Complete in %ss", job_id, processing_time)

        return ConvertResponse(
            success=True,
            job_id=job_id,
            tex_url=f"/api/v2/files/{job_id}/document.tex",
            pdf_url=f"/api/v2/files/{job_id}/document.pdf",
            processing_time=processing_time,
            document_type=semantic_doc.document_type.value,
            template_used=template,
            quality_score=quality_score,
        )

    except docstream.ExtractionError as exc:
        logger.error("[%s] Extraction failed: %s", job_id, exc)
        return ConvertResponse(
            success=False,
            job_id=job_id,
            error=(
                "Could not extract content from this file. "
                "Is it valid and non-password-protected?"
            ),
        )
    except (docstream.StructuringError, docstream.AIUnavailableError) as exc:
        logger.error("[%s] AI analysis failed: %s", job_id, exc)
        return ConvertResponse(
            success=False,
            job_id=job_id,
            error="AI service unavailable. Please try again.",
        )
    except RenderingError as exc:
        logger.error("[%s] Rendering failed: %s", job_id, exc)
        return ConvertResponse(
            success=False,
            job_id=job_id,
            error=(
                "LaTeX rendering failed. "
                "The document structure may be too complex."
            ),
        )
    except TemplateError as exc:
        logger.error("[%s] Template error: %s", job_id, exc)
        return ConvertResponse(
            success=False,
            job_id=job_id,
            error=str(exc),
        )
    except Exception as exc:
        logger.error("[%s] Unexpected error: %s", job_id, exc)
        return ConvertResponse(
            success=False,
            job_id=job_id,
            error="Conversion failed. Please try again.",
        )


def _template_data_to_ast(
    semantic_doc: SemanticDocument,
    template_data: TemplateData,
) -> DocumentAST:
    """Bridge SemanticDocument + TemplateData into a DocumentAST for rendering.

    ``TemplateData.fields`` is a plain ``dict[str, str | list[str]]``.
    ``Section.content`` is ``list[str]`` (one entry per paragraph).
    """
    fields = template_data.fields

    # ── Title ────────────────────────────────────────────────────────────────
    title = semantic_doc.title
    if not title:
        raw = fields.get("title", "")
        title = raw if isinstance(raw, str) else (raw[0] if raw else "")
    title = title or "Untitled Document"

    # ── Abstract ─────────────────────────────────────────────────────────────
    abstract: str | None = None
    if "abstract" in fields:
        raw = fields["abstract"]
        abstract = raw if isinstance(raw, str) else (raw[0] if raw else None)

    # ── Metadata ─────────────────────────────────────────────────────────────
    doc_meta = semantic_doc.metadata or {}
    author: str | None = doc_meta.get("author") or doc_meta.get("name")
    if not author and isinstance(doc_meta.get("authors"), list):
        author = doc_meta["authors"][0] if doc_meta["authors"] else None
    keywords: list[str] = doc_meta.get("keywords", [])

    metadata = DocumentMetadata(
        title=title,
        author=author,
        abstract=abstract,
        keywords=keywords,
    )

    # ── Sections ─────────────────────────────────────────────────────────────
    # Skip fields that belong at the AST top level, not as sections
    _TOP_LEVEL = {"title", "abstract", "name", "contact_info", "author_info"}

    sections: list[Section] = []
    for field_name in _SECTION_FIELDS:
        if field_name not in fields:
            continue
        raw = fields[field_name]
        if isinstance(raw, list):
            content = [s for s in raw if isinstance(s, str) and s.strip()]
        elif isinstance(raw, str) and raw.strip():
            content = [raw]
        else:
            continue
        if not content:
            continue
        sections.append(
            Section(
                heading=field_name.replace("_", " ").title(),
                level=1,
                content=content,
            )
        )

    return DocumentAST(
        title=title,
        abstract=abstract,
        metadata=metadata,
        sections=sections,
        blocks=semantic_doc.raw_blocks,
        tables=[],
        images=[],
    )
