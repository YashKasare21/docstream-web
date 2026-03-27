import os

from fastapi import APIRouter

from models.schemas import HealthResponse


router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Return the current API health status."""
    return HealthResponse(status="ok", version="0.1.0")


@router.get("/v2/providers")
async def list_providers() -> dict:
    """Return availability status for every AI provider in the chain."""
    from docstream.core.ai_provider import GeminiProvider, GroqProvider, OllamaProvider

    providers: list[dict] = []

    gemini_key = os.getenv("GEMINI_API_KEY", "")
    providers.append(
        {
            "name": "Gemini",
            "model": "gemini-1.5-flash",
            "available": bool(gemini_key),
            "priority": 1,
        }
    )

    groq_key = os.getenv("GROQ_API_KEY", "")
    providers.append(
        {
            "name": "Groq",
            "model": "llama-3.1-70b-versatile",
            "available": bool(groq_key),
            "priority": 2,
        }
    )

    ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    op = OllamaProvider(base_url=ollama_url)
    providers.append(
        {
            "name": "Ollama",
            "model": op.model,
            "available": op.is_available(),
            "priority": 3,
            "base_url": ollama_url,
        }
    )

    active = next((p["name"] for p in providers if p["available"]), None)
    return {"providers": providers, "active": active}
