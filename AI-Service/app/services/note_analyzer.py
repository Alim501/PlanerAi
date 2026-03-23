"""
Note analysis service using AI
"""
import logging
from typing import Dict, Any
from app.models import AnalyzeNoteRequest, NoteAnalysis
from app.services.gemini_service import get_gemini_service
from app.services.file_parser import get_file_parser

logger = logging.getLogger(__name__)

MIME_TYPES = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "txt": "text/plain",
}


class NoteAnalyzerService:
    """Service for analyzing notes using AI"""

    def __init__(self):
        self.llm = get_gemini_service()
        self.file_parser = get_file_parser()

    async def analyze_note(self, request: AnalyzeNoteRequest) -> NoteAnalysis:
        try:
            if request.file_url:
                # Native Gemini File API — sends file directly, best quality
                mime_type = MIME_TYPES.get(request.file_type.lower(), "application/octet-stream")
                logger.info(f"Analyzing file via Gemini File API: {request.file_url}")
                response = await self.llm.analyze_file(
                    file_url=request.file_url,
                    mime_type=mime_type,
                    prompt=self._build_file_prompt(),
                    system_prompt=self._get_system_prompt(),
                    temperature=0.5,
                )
            elif request.file_path:
                # Fallback: extract text locally, then send to Gemini
                logger.info(f"Analyzing file via text extraction: {request.file_path}")
                text_content = await self.file_parser.parse_file(request.file_path, request.file_type)
                if not text_content or not text_content.strip():
                    raise ValueError("No text content extracted from file")
                response = await self.llm.generate_json(
                    prompt=self._build_text_prompt(text_content),
                    system_prompt=self._get_system_prompt(),
                    temperature=0.5,
                )
            else:
                raise ValueError("Either file_url or file_path must be provided")

            analysis = self._parse_response(response)
            logger.info(f"Successfully analyzed note: {len(analysis.key_concepts)} concepts found")
            return analysis

        except Exception as e:
            logger.error(f"Error analyzing note: {e}")
            raise

    def _get_system_prompt(self) -> str:
        return """You are an expert educational content analyzer.
Your task is to analyze study notes and extract key information.

Guidelines:
- Identify the 5-7 most important key concepts (specific terms, not categories)
- Provide a concise summary in 1-2 sentences (max 200 characters)
- Detect the difficulty level (beginner, intermediate, advanced)
- Detect the language of the content
- Use Russian for summary if the content is in Russian

Respond with a JSON object matching this structure:
{
  "summary": "Brief summary of the content",
  "key_concepts": ["concept 1", "concept 2", "concept 3"],
  "difficulty": "intermediate",
  "language": "ru"
}"""

    def _build_file_prompt(self) -> str:
        return """Проанализируй этот учебный документ и предоставь:
1. Краткое резюме (1-2 предложения, не более 200 символов)
2. 5-7 ключевых концепций и терминов (конкретные термины из документа)
3. Уровень сложности (beginner/intermediate/advanced)
4. Язык документа (ru/en/etc)"""

    def _build_text_prompt(self, text: str) -> str:
        word_count = len(text.split())
        return f"""Проанализируй следующий учебный материал:

{text}

Количество слов: {word_count}

Предоставь:
1. Краткое резюме (1-2 предложения, не более 200 символов)
2. 5-7 ключевых концепций и терминов (конкретные термины из документа)
3. Уровень сложности
4. Язык документа"""

    def _parse_response(self, response: Dict[str, Any]) -> NoteAnalysis:
        try:
            raw_summary = response.get("summary", "Анализ содержимого")
            summary = raw_summary[:250] if len(raw_summary) > 250 else raw_summary
            return NoteAnalysis(
                summary=summary,
                key_concepts=response.get("key_concepts", [])[:7],
                difficulty=response.get("difficulty", "intermediate"),
                word_count=response.get("word_count"),
                language=response.get("language", "ru"),
            )
        except Exception as e:
            logger.error(f"Error parsing analysis response: {e}")
            return NoteAnalysis(
                summary="Не удалось выполнить анализ",
                key_concepts=[],
                topics=[],
                difficulty="intermediate",
                suggested_tags=[],
                language="unknown",
            )


# Singleton instance
_note_analyzer: NoteAnalyzerService | None = None


def get_note_analyzer() -> NoteAnalyzerService:
    """Get singleton note analyzer instance"""
    global _note_analyzer
    if _note_analyzer is None:
        _note_analyzer = NoteAnalyzerService()
    return _note_analyzer
