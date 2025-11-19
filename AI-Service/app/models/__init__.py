"""Models package"""
from .requests import (
    GeneratePlanRequest,
    AnalyzeNoteRequest,
    ChatRequest,
    ImproveTaskRequest,
    DifficultyLevel,
)
from .responses import (
    GeneratedPlan,
    WeekPlan,
    NoteAnalysis,
    ChatResponse,
    TaskImprovement,
    HealthCheckResponse,
)

__all__ = [
    # Requests
    "GeneratePlanRequest",
    "AnalyzeNoteRequest",
    "ChatRequest",
    "ImproveTaskRequest",
    "DifficultyLevel",
    # Responses
    "GeneratedPlan",
    "WeekPlan",
    "NoteAnalysis",
    "ChatResponse",
    "TaskImprovement",
    "HealthCheckResponse",
]
