"""
Request models for AI endpoints
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class DifficultyLevel(str, Enum):
    """Difficulty level for study plans"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class NoteContext(BaseModel):
    """Context of an existing student note for plan generation"""
    note_id: int = Field(..., description="Note ID in the database")
    title: str = Field(..., description="Note title")
    summary: Optional[str] = Field(default=None, description="AI-generated summary")
    keywords: List[str] = Field(default_factory=list, description="Extracted keywords")
    difficulty: str = Field(default="intermediate", description="Note difficulty level")


class GeneratePlanRequest(BaseModel):
    """Request model for plan generation"""
    subject: str = Field(..., description="Subject name (e.g., 'Математический анализ')")
    duration_weeks: int = Field(..., ge=1, le=52, description="Duration in weeks (1-52)")
    level: DifficultyLevel = Field(default=DifficultyLevel.INTERMEDIATE, description="Difficulty level")
    topics: Optional[List[str]] = Field(default=None, description="Specific topics to cover")
    goals: Optional[str] = Field(default=None, description="Learning goals")
    available_notes: Optional[List[NoteContext]] = Field(default=None, description="Student's existing notes to use as resources")


class AnalyzeNoteRequest(BaseModel):
    """Request model for note analysis"""
    file_url: Optional[str] = Field(default=None, description="S3 URL of the file (preferred)")
    file_path: Optional[str] = Field(default=None, description="Local path to the file (fallback for tests)")
    file_type: str = Field(..., description="File type (pdf, docx, txt, jpg, png)")
    subject_id: Optional[int] = Field(default=None, description="Related subject ID")


class ChatRequest(BaseModel):
    """Request model for chat/assistant"""
    message: str = Field(..., description="User message")
    subject_id: Optional[int] = Field(default=None, description="Context subject ID")
    plan_id: Optional[int] = Field(default=None, description="Context plan ID")
    conversation_history: Optional[List[dict]] = Field(default=None, description="Previous messages")


class ImproveTaskRequest(BaseModel):
    """Request model for task improvement suggestions"""
    task_title: str = Field(..., description="Current task title")
    task_description: Optional[str] = Field(default=None, description="Current task description")
    subject: str = Field(..., description="Subject name")
