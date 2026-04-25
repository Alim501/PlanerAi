"""
Google Gemini service with retry logic and rate limiting
"""
import io
import json
import logging
import asyncio
import httpx
from typing import Optional, Dict, Any
from google import genai
from google.genai import types
from app.config import get_settings

logger = logging.getLogger(__name__)

# Коды ошибок при которых имеет смысл повторить запрос
_RETRYABLE_STATUS_CODES = {429, 503, 500}


def _is_retryable(exc: Exception) -> bool:
    msg = str(exc)
    return any(str(code) in msg for code in _RETRYABLE_STATUS_CODES)


def _extract_retry_delay(exc: Exception) -> Optional[float]:
    """Парсим retryDelay из сообщения Gemini, если есть."""
    import re
    match = re.search(r"retryDelay.*?(\d+)s", str(exc))
    if match:
        return float(match.group(1)) + 1.0
    return None


class GeminiService:
    def __init__(self):
        self.settings = get_settings()
        self.client = genai.Client(api_key=self.settings.gemini_api_key)
        self.model_name = self.settings.gemini_model
        # Семафор — не более N одновременных запросов к Gemini
        self._semaphore = asyncio.Semaphore(self.settings.gemini_max_concurrent)
        logger.info(
            f"Gemini service initialized: model={self.model_name}, "
            f"max_concurrent={self.settings.gemini_max_concurrent}, "
            f"max_retries={self.settings.gemini_max_retries}"
        )

    async def _call_with_retry(self, fn, *args, **kwargs):
        """Выполняет fn с exponential backoff при 429/503."""
        max_retries = self.settings.gemini_max_retries
        base_delay = self.settings.gemini_retry_base_delay

        for attempt in range(max_retries + 1):
            try:
                async with self._semaphore:
                    return await asyncio.to_thread(fn, *args, **kwargs)
            except Exception as exc:
                if not _is_retryable(exc) or attempt == max_retries:
                    raise

                # Берём задержку из ответа Gemini или считаем сами
                suggested = _extract_retry_delay(exc)
                delay = suggested if suggested else base_delay * (2 ** attempt)
                logger.warning(
                    f"Gemini retryable error (attempt {attempt + 1}/{max_retries}), "
                    f"waiting {delay:.1f}s: {type(exc).__name__}"
                )
                await asyncio.sleep(delay)

    def _parse_json_safe(self, raw: str) -> Dict[str, Any]:
        """Парсит JSON из ответа модели, убирает markdown-обёртку если есть."""
        import re
        text = raw.strip()

        # Убираем ```json ... ``` или ``` ... ```
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
        text = text.strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            # Ответ обрезан — пробуем найти последний валидный объект
            logger.warning(f"JSON parse failed ({e}), trying to recover truncated response")
            # Ищем последний закрытый корневой объект
            depth = 0
            end = 0
            for i, ch in enumerate(text):
                if ch == '{':
                    depth += 1
                elif ch == '}':
                    depth -= 1
                    if depth == 0:
                        end = i + 1
            if end > 0:
                try:
                    return json.loads(text[:end])
                except json.JSONDecodeError:
                    pass
            logger.error(f"Could not recover JSON. Raw (first 500 chars): {text[:500]}")
            raise

    async def check_connection(self) -> bool:
        try:
            response = await self._call_with_retry(
                self.client.models.generate_content,
                model=self.model_name,
                contents="test",
            )
            return bool(response.text)
        except Exception as e:
            logger.error(f"Gemini connection check failed: {e}")
            return False

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
    ) -> str:
        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=temperature,
        )
        response = await self._call_with_retry(
            self.client.models.generate_content,
            model=self.model_name,
            contents=prompt,
            config=config,
        )
        return response.text.strip()

    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        json_instruction = (
            "You are a helpful assistant. "
            "Always respond with valid JSON only. "
            "Never include markdown, code blocks, or any text outside the JSON object."
        )
        if system_prompt:
            json_instruction = f"{json_instruction}\n\n{system_prompt}"

        config = types.GenerateContentConfig(
            system_instruction=json_instruction,
            temperature=temperature,
            response_mime_type="application/json",
            max_output_tokens=8192,
        )
        try:
            response = await self._call_with_retry(
                self.client.models.generate_content,
                model=self.model_name,
                contents=prompt,
                config=config,
            )
            raw = response.text
            return self._parse_json_safe(raw)
        except Exception as e:
            logger.error(f"Error generating JSON: {e}")
            raise

    async def analyze_file(
        self,
        file_url: str,
        mime_type: str,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.5,
    ) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.get(file_url, timeout=30)
            response.raise_for_status()
            file_content = response.content

        logger.info(f"Downloaded {len(file_content)} bytes from {file_url}")

        file_ref = await asyncio.to_thread(
            self.client.files.upload,
            file=io.BytesIO(file_content),
            config=types.UploadFileConfig(mime_type=mime_type),
        )
        logger.info(f"Uploaded file to Gemini: {file_ref.name}")

        json_instruction = (
            "You are a helpful assistant. "
            "Always respond with valid JSON only. "
            "Never include markdown, code blocks, or any text outside the JSON object."
        )
        if system_prompt:
            json_instruction = f"{json_instruction}\n\n{system_prompt}"

        config = types.GenerateContentConfig(
            system_instruction=json_instruction,
            temperature=temperature,
            response_mime_type="application/json",
            max_output_tokens=4096,
        )
        try:
            result = await self._call_with_retry(
                self.client.models.generate_content,
                model=self.model_name,
                contents=[file_ref, prompt],
                config=config,
            )
            return self._parse_json_safe(result.text)
        except Exception as e:
            logger.error(f"Error analyzing file: {e}")
            raise


_gemini_service: Optional[GeminiService] = None


def get_gemini_service() -> GeminiService:
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service
