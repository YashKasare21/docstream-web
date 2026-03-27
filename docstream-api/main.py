from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routes.convert import router as convert_router
from routes.feedback import router as feedback_router
from routes.health import router as health_router
from utils.file_handler import cleanup_old_jobs


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    init_db()
    cleanup_old_jobs()
    yield


app = FastAPI(
    title="Docstream API",
    description="AI-powered PDF to LaTeX conversion API.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://docstream-web.vercel.app",
        "*",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Routes
app.include_router(convert_router)
app.include_router(feedback_router)
app.include_router(health_router)


@app.get("/")
async def root():
    return {"message": "Docstream API", "docs": "/docs"}
