"""
Note analysis service using AI
"""
import logging
from typing import Dict, Any
from app.models import AnalyzeNoteRequest, NoteAnalysis
from app.services.ollama_service import get_ollama_service
from app.services.file_parser import get_file_parser

logger = logging.getLogger(__name__)


class NoteAnalyzerService:
    """Service for analyzing notes using AI"""

    def __init__(self):
        self.ollama = get_ollama_service()
        self.file_parser = get_file_parser()

    async def analyze_note(self, request: AnalyzeNoteRequest) -> NoteAnalysis:
        """
        Analyze a note file using AI

        Args:
            request: Note analysis request

        Returns:
            Note analysis results
        """
        try:
            # Parse the file to extract text
            logger.info(f"Parsing file: {request.file_path}")
            text_content = await self.file_parser.parse_file(
                request.file_path,
                request.file_type
            )

            if not text_content or len(text_content.strip()) == 0:
                raise ValueError("No text content extracted from file")

            # Analyze the text using AI
            logger.info(f"Analyzing note content ({len(text_content)} chars)")
            analysis = await self._analyze_text(text_content)

            logger.info(f"Successfully analyzed note: {len(analysis.key_concepts)} concepts found")
            return analysis

        except Exception as e:
            logger.error(f"Error analyzing note: {e}")
            raise

    async def _analyze_text(self, text: str) -> NoteAnalysis:
        """Analyze text content using AI"""
        try:
            # Truncate very long texts to avoid token limits
            max_chars = 8000
            if len(text) > max_chars:
                text = text[:max_chars] + "..."
                logger.warning(f"Text truncated to {max_chars} characters")

            prompt = self._build_analysis_prompt(text)

            response = await self.ollama.generate_json(
                prompt=prompt,
                system_prompt=self._get_system_prompt(),
                temperature=0.5,
            )

            # Parse response into NoteAnalysis
            analysis = self._parse_analysis_response(response, text)
            return analysis

        except Exception as e:
            logger.error(f"Error analyzing text: {e}")
            raise

    def _get_system_prompt(self) -> str:
        """Get system prompt for note analysis"""
        return """You are an expert educational content analyzer.
Your task is to analyze study notes and extract key information.

Guidelines:
- Identify main topics and key concepts
- Provide a concise but comprehensive summary
- Detect the difficulty level (beginner, intermediate, advanced)
- Suggest relevant tags for categorization
- Detect the language of the content
- Use Russian for summary and tags if the content is in Russian

Respond with a JSON object matching this structure:
{
  "summary": "Brief summary of the content",
  "key_concepts": ["concept 1", "concept 2"],
  "topics": ["topic 1", "topic 2"],
  "difficulty": "intermediate",
  "suggested_tags": ["tag1", "tag2"],
  "language": "ru"
}"""

    def _build_analysis_prompt(self, text: str) -> str:
        """Build the analysis prompt"""
        word_count = len(text.split())

        return f"""Проанализируй следующий учебный материал:

{text}

Количество слов: {word_count}

Предоставь:
1. Краткое резюме (2-3 предложения)
2. Ключевые концепции и термины
3. Основные темы
4. Уровень сложности
5. Теги для категоризации
6. Язык документа"""

    def _parse_analysis_response(
        self,
        response: Dict[str, Any],
        original_text: str,
    ) -> NoteAnalysis:
        """Parse AI response into NoteAnalysis"""
        try:
            word_count = len(original_text.split())

            analysis = NoteAnalysis(
                summary=response.get("summary", "Анализ содержимого"),
                key_concepts=response.get("key_concepts", []),
                topics=response.get("topics", []),
                difficulty=response.get("difficulty", "intermediate"),
                suggested_tags=response.get("suggested_tags", []),
                word_count=word_count,
                language=response.get("language", "ru"),
            )

            return analysis

        except Exception as e:
            logger.error(f"Error parsing analysis response: {e}")
            # Return basic analysis as fallback
            return self._create_fallback_analysis(original_text)

    def _create_fallback_analysis(self, text: str) -> NoteAnalysis:
        """Create a basic fallback analysis"""
        word_count = len(text.split())
        preview = text[:200] + "..." if len(text) > 200 else text

        return NoteAnalysis(
            summary=f"Документ содержит {word_count} слов. {preview}",
            key_concepts=["Не удалось определить"],
            topics=["Общая тема"],
            difficulty="intermediate",
            suggested_tags=["учебный материал"],
            word_count=word_count,
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
