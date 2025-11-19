"""
Ollama service for LLM integration
"""
import logging
from typing import Optional, Dict, Any
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from app.config import get_settings

logger = logging.getLogger(__name__)


class OllamaService:
    """Service for interacting with Ollama LLM"""

    def __init__(self):
        self.settings = get_settings()
        self.llm = ChatOllama(
            model=self.settings.ollama_model,
            base_url=self.settings.ollama_base_url,
            temperature=0.7,
        )
        logger.info(f"Ollama service initialized with model: {self.settings.ollama_model}")

    async def check_connection(self) -> bool:
        """Check if Ollama is running and accessible"""
        try:
            response = await self.llm.ainvoke([HumanMessage(content="test")])
            return bool(response)
        except Exception as e:
            logger.error(f"Ollama connection check failed: {e}")
            return False

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
    ) -> str:
        """
        Generate text response from LLM

        Args:
            prompt: User prompt
            system_prompt: Optional system prompt for context
            temperature: Sampling temperature (0.0 - 1.0)

        Returns:
            Generated text response
        """
        try:
            messages = []
            if system_prompt:
                messages.append(SystemMessage(content=system_prompt))
            messages.append(HumanMessage(content=prompt))

            llm = ChatOllama(
                model=self.settings.ollama_model,
                base_url=self.settings.ollama_base_url,
                temperature=temperature,
            )

            parser = StrOutputParser()
            chain = llm | parser
            response = await chain.ainvoke(messages)

            return response.strip()
        except Exception as e:
            logger.error(f"Error generating text: {e}")
            raise

    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        """
        Generate structured JSON response from LLM

        Args:
            prompt: User prompt
            system_prompt: Optional system prompt for context
            temperature: Sampling temperature (0.0 - 1.0)

        Returns:
            Parsed JSON response
        """
        try:
            messages = []

            # Enhanced system prompt for JSON output
            json_system_prompt = (
                "You are a helpful assistant that always responds with valid JSON. "
                "Never include markdown code blocks or any text outside the JSON object. "
                "Respond ONLY with a valid JSON object."
            )

            if system_prompt:
                json_system_prompt = f"{json_system_prompt}\n\n{system_prompt}"

            messages.append(SystemMessage(content=json_system_prompt))
            messages.append(HumanMessage(content=prompt))

            llm = ChatOllama(
                model=self.settings.ollama_model,
                base_url=self.settings.ollama_base_url,
                temperature=temperature,
                format="json",  # Force JSON output
            )

            parser = JsonOutputParser()
            chain = llm | parser
            response = await chain.ainvoke(messages)

            return response
        except Exception as e:
            logger.error(f"Error generating JSON: {e}")
            raise

    async def generate_with_context(
        self,
        prompt: str,
        context: str,
        system_prompt: Optional[str] = None,
    ) -> str:
        """
        Generate response with additional context

        Args:
            prompt: User prompt
            context: Additional context information
            system_prompt: Optional system prompt

        Returns:
            Generated text response
        """
        enhanced_prompt = f"Context:\n{context}\n\nQuestion: {prompt}"
        return await self.generate_text(enhanced_prompt, system_prompt)


# Singleton instance
_ollama_service: Optional[OllamaService] = None


def get_ollama_service() -> OllamaService:
    """Get singleton Ollama service instance"""
    global _ollama_service
    if _ollama_service is None:
        _ollama_service = OllamaService()
    return _ollama_service
