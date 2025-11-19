"""
Health check router
"""
import logging
from fastapi import APIRouter, Depends
from app.models import HealthCheckResponse
from app.services import get_ollama_service, OllamaService
from app.config import get_settings, Settings

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthCheckResponse)
async def health_check(
    ollama_service: OllamaService = Depends(get_ollama_service),
    settings: Settings = Depends(get_settings),
):
    """
    Health check endpoint

    Returns:
        Service status and Ollama connection status
    """
    ollama_connected = await ollama_service.check_connection()

    return HealthCheckResponse(
        status="healthy" if ollama_connected else "degraded",
        ollama_connected=ollama_connected,
        model=settings.ollama_model,
        version="1.0.0",
    )


@router.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "PlannerAI - AI Service",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }
