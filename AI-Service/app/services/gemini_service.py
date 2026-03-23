"""
Google Gemini service for LLM integration
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


class GeminiService:
    """Service for interacting with Google Gemini API"""

    def __init__(self):
        self.settings = get_settings()
        self.client = genai.Client(api_key=self.settings.gemini_api_key)
        self.model_name = self.settings.gemini_model
        logger.info(f"Gemini service initialized with model: {self.model_name}")

    async def check_connection(self) -> bool:
        """Check if Gemini API is accessible"""
        try:
            response = await asyncio.to_thread(
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
        """Generate plain text response"""
        try:
            config = types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=temperature,
            )
            response = await asyncio.to_thread(
                self.client.models.generate_content,
                model=self.model_name,
                contents=prompt,
                config=config,
            )
            return response.text.strip()
        except Exception as e:
            logger.error(f"Error generating text: {e}")
            raise

    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        """Generate structured JSON response using Gemini native JSON mode"""
        try:
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
            )
            response = await asyncio.to_thread(
                self.client.models.generate_content,
                model=self.model_name,
                contents=prompt,
                config=config,
            )
            return json.loads(response.text)
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
        """Download file from URL and analyze it natively via Gemini File API"""
        try:
            # Download file from S3
            async with httpx.AsyncClient() as client:
                response = await client.get(file_url, timeout=30)
                response.raise_for_status()
                file_content = response.content

            logger.info(f"Downloaded {len(file_content)} bytes from {file_url}")

            # Upload to Gemini File API
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
            )
            result = await asyncio.to_thread(
                self.client.models.generate_content,
                model=self.model_name,
                contents=[file_ref, prompt],
                config=config,
            )
            return json.loads(result.text)

        except Exception as e:
            logger.error(f"Error analyzing file: {e}")
            raise


# Singleton instance
_gemini_service: Optional[GeminiService] = None


def get_gemini_service() -> GeminiService:
    """Get singleton Gemini service instance"""
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service
