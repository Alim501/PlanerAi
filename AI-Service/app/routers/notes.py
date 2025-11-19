"""
Notes router - AI note analysis endpoints
"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from app.models import AnalyzeNoteRequest, NoteAnalysis
from app.services import get_note_analyzer, NoteAnalyzerService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notes", tags=["Notes"])


@router.post("/analyze", response_model=NoteAnalysis)
async def analyze_note(
    request: AnalyzeNoteRequest,
    note_analyzer: NoteAnalyzerService = Depends(get_note_analyzer),
):
    """
    Analyze a note file using AI

    Args:
        request: Note analysis request with file path and type

    Returns:
        Analysis results including summary, key concepts, and topics
    """
    try:
        logger.info(f"Analyzing note: {request.file_path}")
        analysis = await note_analyzer.analyze_note(request)
        return analysis
    except Exception as e:
        logger.error(f"Error in analyze_note endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
