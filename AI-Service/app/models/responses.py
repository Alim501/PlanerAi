"""
Response models for AI endpoints
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class TaskPlan(BaseModel):
    """Structured task with linked resources"""
    title: str = Field(..., description="Task title")
    description: Optional[str] = Field(default=None, description="Task description")
    internal_note_ids: List[int] = Field(default_factory=list, description="IDs of matching student notes")
    external_resources: List[str] = Field(default_factory=list, description="External resources (books, links)")


class WeekPlan(BaseModel):
    """Weekly plan structure"""
    week_number: int = Field(..., description="Week number")
    title: str = Field(..., description="Week title/theme")
    topics: List[str] = Field(..., description="Topics to cover this week")
    tasks: List[TaskPlan] = Field(..., description="Tasks/assignments for the week")
    estimated_hours: int = Field(..., description="Estimated study hours")
    resources: Optional[List[str]] = Field(default=None, description="Recommended resources")


class GeneratedPlan(BaseModel):
    """Generated study plan response"""
    title: str = Field(..., description="Plan title")
    subject: str = Field(..., description="Subject name")
    duration_weeks: int = Field(..., description="Total duration in weeks")
    difficulty: str = Field(..., description="Difficulty level")
    description: str = Field(..., description="Plan description/overview")
    learning_outcomes: List[str] = Field(..., description="Expected learning outcomes")
    weeks: List[WeekPlan] = Field(..., description="Weekly breakdown")
    prerequisites: Optional[List[str]] = Field(default=None, description="Required prerequisites")
    recommended_resources: Optional[List[str]] = Field(default=None, description="Overall resources")


class NoteAnalysis(BaseModel):
    """Note analysis response"""
    summary: str = Field(..., description="Brief summary of the note")
    key_concepts: List[str] = Field(..., description="Key concepts identified (5-7 terms)")
    difficulty: str = Field(..., description="Estimated difficulty level")
    word_count: Optional[int] = Field(default=None, description="Word count (if text)")
    language: Optional[str] = Field(default=None, description="Detected language")


class ChatResponse(BaseModel):
    """Chat/assistant response"""
    message: str = Field(..., description="Assistant response")
    suggestions: Optional[List[str]] = Field(default=None, description="Follow-up suggestions")
    related_topics: Optional[List[str]] = Field(default=None, description="Related topics")


class TaskImprovement(BaseModel):
    """Task improvement suggestions"""
    improved_title: str = Field(..., description="Improved task title")
    improved_description: str = Field(..., description="Improved task description")
    suggestions: List[str] = Field(..., description="Improvement suggestions")
    estimated_time: Optional[str] = Field(default=None, description="Estimated completion time")
    difficulty: Optional[str] = Field(default=None, description="Task difficulty")


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    ollama_connected: bool = Field(..., description="LLM connection status")
    model: str = Field(..., description="Active model")
    version: str = Field(default="1.0.0", description="Service version")
