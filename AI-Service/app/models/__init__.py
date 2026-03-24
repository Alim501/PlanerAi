"""Models package"""
from .requests import (
    GeneratePlanRequest,
    NoteContext,
    AnalyzeNoteRequest,
    ChatRequest,
    ImproveTaskRequest,
    DifficultyLevel,
)
from .responses import (
    GeneratedPlan,
    WeekPlan,
    TaskPlan,
    NoteAnalysis,
    ChatResponse,
    TaskImprovement,
    HealthCheckResponse,
)

__all__ = [
    # Requests
    "GeneratePlanRequest",
    "NoteContext",
    "AnalyzeNoteRequest",
    "ChatRequest",
    "ImproveTaskRequest",
    "DifficultyLevel",
    # Responses
    "GeneratedPlan",
    "WeekPlan",
    "TaskPlan",
    "NoteAnalysis",
    "ChatResponse",
    "TaskImprovement",
    "HealthCheckResponse",
]
