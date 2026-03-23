"""
Health check router
"""
import logging
from fastapi import APIRouter, Depends
from app.models import HealthCheckResponse
from app.services import get_gemini_service, GeminiService
from app.config import get_settings, Settings

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthCheckResponse)
async def health_check(
    gemini_service: GeminiService = Depends(get_gemini_service),
    settings: Settings = Depends(get_settings),
):
    """
    Health check endpoint

    Returns:
        Service status and Gemini connection status
    """
    gemini_connected = await gemini_service.check_connection()

    return HealthCheckResponse(
        status="healthy" if gemini_connected else "degraded",
        ollama_connected=gemini_connected,
        model=settings.gemini_model,
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
