"""
Study plan generation service
"""
import logging
from typing import Dict, Any, List
from app.models import GeneratePlanRequest, GeneratedPlan, WeekPlan, TaskPlan
from app.services.gemini_service import get_gemini_service

logger = logging.getLogger(__name__)


class PlanGeneratorService:
    """Service for generating AI-powered study plans"""

    def __init__(self):
        self.llm = get_gemini_service()

    async def generate_plan(self, request: GeneratePlanRequest) -> GeneratedPlan:
        """
        Generate a structured study plan using AI

        Args:
            request: Plan generation request

        Returns:
            Generated study plan
        """
        try:
            # Build the prompt
            prompt = self._build_plan_prompt(request)

            # Generate plan using Gemini
            logger.info(f"Generating plan for subject: {request.subject}")
            response = await self.llm.generate_json(
                prompt=prompt,
                system_prompt=self._get_system_prompt(),
                temperature=0.7,
            )

            # Parse and validate response
            plan = self._parse_plan_response(response, request)

            logger.info(f"Successfully generated plan: {plan.title}")
            return plan

        except Exception as e:
            logger.error(f"Error generating plan: {e}")
            raise

    def _get_system_prompt(self) -> str:
        """Get system prompt for plan generation"""
        return """You are an expert educational planner specializing in creating structured study plans.
Your task is to create comprehensive, well-organized study plans that help students learn effectively.

Guidelines:
- Break down complex topics into manageable weekly chunks
- Provide clear learning objectives for each week
- Suggest practical tasks and assignments
- Include realistic time estimates
- If student notes are provided, prioritize them as resources and reference their IDs in internal_note_ids
- For topics not covered by student notes, suggest external resources (books, articles, online courses)
- Ensure progressive difficulty throughout the plan
- Use Russian language for all content

Respond with a JSON object matching this structure:
{
  "title": "Plan title",
  "description": "Overview description",
  "learning_outcomes": ["outcome 1", "outcome 2"],
  "weeks": [
    {
      "week_number": 1,
      "title": "Week theme",
      "topics": ["topic 1", "topic 2"],
      "tasks": [
        {
          "title": "Task title",
          "description": "Brief task description",
          "internal_note_ids": [1, 2],
          "external_resources": ["Book or URL if no matching note"]
        }
      ],
      "estimated_hours": 10,
      "resources": ["general week resource"]
    }
  ],
  "prerequisites": ["prerequisite 1"],
  "recommended_resources": ["resource 1"]
}

IMPORTANT: internal_note_ids must only contain IDs from the provided student notes list. If no notes match a task, use an empty list and provide external_resources instead."""

    def _build_plan_prompt(self, request: GeneratePlanRequest) -> str:
        """Build the plan generation prompt"""
        prompt_parts = [
            f"Создай детальный учебный план по предмету: {request.subject}",
            f"Продолжительность: {request.duration_weeks} недель",
            f"Уровень сложности: {request.level.value}",
        ]

        if request.topics:
            topics_str = ", ".join(request.topics)
            prompt_parts.append(f"Обязательные темы для изучения: {topics_str}")

        if request.goals:
            prompt_parts.append(f"Цели обучения: {request.goals}")

        if request.available_notes:
            prompt_parts.append(
                f"\nУ студента есть {len(request.available_notes)} конспект(а/ов) — используй их как приоритетные ресурсы:"
            )
            for note in request.available_notes:
                keywords_str = ", ".join(note.keywords[:6]) if note.keywords else "—"
                summary_str = f' | Краткое содержание: "{note.summary}"' if note.summary else ""
                prompt_parts.append(
                    f"  [id={note.note_id}] \"{note.title}\" (уровень: {note.difficulty}, ключевые слова: {keywords_str}){summary_str}"
                )
            prompt_parts.append(
                "Для каждой задачи укажи internal_note_ids — список ID подходящих конспектов из списка выше. "
                "Если подходящих конспектов нет — оставь internal_note_ids пустым и укажи external_resources."
            )
        else:
            prompt_parts.append(
                "У студента нет конспектов. Для каждой задачи предложи external_resources "
                "(учебники, онлайн-курсы, статьи)."
            )

        prompt_parts.append(
            "\nСоздай структурированный план с разбивкой по неделям. "
            "Для каждой недели укажи темы, задания и примерное количество часов на изучение."
        )

        return "\n".join(prompt_parts)

    def _parse_plan_response(
        self,
        response: Dict[str, Any],
        request: GeneratePlanRequest,
    ) -> GeneratedPlan:
        """Parse and validate the AI response into a GeneratedPlan"""
        try:
            # Parse weeks
            weeks = []
            for week_data in response.get("weeks", []):
                raw_tasks = week_data.get("tasks", [])
                tasks = []
                for t in raw_tasks:
                    if isinstance(t, dict):
                        tasks.append(TaskPlan(
                            title=t.get("title", ""),
                            description=t.get("description"),
                            internal_note_ids=t.get("internal_note_ids", []),
                            external_resources=t.get("external_resources", []),
                        ))
                    else:
                        # fallback: plain string task from old format
                        tasks.append(TaskPlan(title=str(t), internal_note_ids=[], external_resources=[]))
                week = WeekPlan(
                    week_number=week_data.get("week_number", 0),
                    title=week_data.get("title", ""),
                    topics=week_data.get("topics", []),
                    tasks=tasks,
                    estimated_hours=week_data.get("estimated_hours", 10),
                    resources=week_data.get("resources"),
                )
                weeks.append(week)

            # Create the plan
            plan = GeneratedPlan(
                title=response.get("title", f"План обучения: {request.subject}"),
                subject=request.subject,
                duration_weeks=request.duration_weeks,
                difficulty=request.level.value,
                description=response.get("description", ""),
                learning_outcomes=response.get("learning_outcomes", []),
                weeks=weeks,
                prerequisites=response.get("prerequisites"),
                recommended_resources=response.get("recommended_resources"),
            )

            return plan

        except Exception as e:
            logger.error(f"Error parsing plan response: {e}")
            # Return a basic plan as fallback
            return self._create_fallback_plan(request)

    def _create_fallback_plan(self, request: GeneratePlanRequest) -> GeneratedPlan:
        """Create a basic fallback plan if AI generation fails"""
        weeks = []
        hours_per_week = 10

        for i in range(request.duration_weeks):
            week = WeekPlan(
                week_number=i + 1,
                title=f"Неделя {i + 1}",
                topics=["Основные концепции", "Практические задания"],
                tasks=[
                    TaskPlan(title="Изучение теоретического материала", internal_note_ids=[], external_resources=[]),
                    TaskPlan(title="Выполнение практических заданий", internal_note_ids=[], external_resources=[]),
                ],
                estimated_hours=hours_per_week,
            )
            weeks.append(week)

        return GeneratedPlan(
            title=f"План обучения: {request.subject}",
            subject=request.subject,
            duration_weeks=request.duration_weeks,
            difficulty=request.level.value,
            description=f"Структурированный план изучения предмета {request.subject}",
            learning_outcomes=["Освоение базовых концепций", "Развитие практических навыков"],
            weeks=weeks,
        )


# Singleton instance
_plan_generator: PlanGeneratorService | None = None


def get_plan_generator() -> PlanGeneratorService:
    """Get singleton plan generator instance"""
    global _plan_generator
    if _plan_generator is None:
        _plan_generator = PlanGeneratorService()
    return _plan_generator
