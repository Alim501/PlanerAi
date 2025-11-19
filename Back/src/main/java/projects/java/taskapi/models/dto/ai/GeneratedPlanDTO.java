package projects.java.taskapi.models.dto.ai;

import java.util.List;

public record GeneratedPlanDTO(
        String title,
        String subject,
        int durationWeeks,
        String difficulty,
        String description,
        List<String> learningOutcomes,
        List<WeekPlanDTO> weeks,
        List<String> prerequisites,
        List<String> recommendedResources
) {
}
