"""
Plans router - AI plan generation endpoints
"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from app.models import GeneratePlanRequest, GeneratedPlan
from app.services import get_plan_generator, PlanGeneratorService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/plans", tags=["Plans"])


@router.post("/generate", response_model=GeneratedPlan)
async def generate_plan(
    request: GeneratePlanRequest,
    plan_generator: PlanGeneratorService = Depends(get_plan_generator),
):
    """
    Generate a study plan using AI

    Args:
        request: Plan generation request with subject, duration, and preferences

    Returns:
        Generated study plan with weekly breakdown
    """
    try:
        logger.info(f"Generating plan for {request.subject}")
        plan = await plan_generator.generate_plan(request)
        return plan
    except Exception as e:
        logger.error(f"Error in generate_plan endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
