"""
PlannerAI - AI Service
FastAPI application for AI-powered educational features
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import plans_router, notes_router, health_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    # Startup
    settings = get_settings()
    logger.info("=" * 60)
    logger.info("Starting PlannerAI AI Service")
    logger.info(f"Version: 1.0.0")
    logger.info(f"Ollama URL: {settings.ollama_base_url}")
    logger.info(f"Ollama Model: {settings.ollama_model}")
    logger.info(f"Port: {settings.port}")
    logger.info("=" * 60)

    yield

    # Shutdown
    logger.info("Shutting down PlannerAI AI Service")


# Create FastAPI app
app = FastAPI(
    title="PlannerAI - AI Service",
    description="AI-powered microservice for educational planning and content analysis",
    version="1.0.0",
    lifespan=lifespan,
)

# Get settings
settings = get_settings()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(plans_router, prefix="/api/ai")
app.include_router(notes_router, prefix="/api/ai")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level=settings.log_level.lower(),
    )
