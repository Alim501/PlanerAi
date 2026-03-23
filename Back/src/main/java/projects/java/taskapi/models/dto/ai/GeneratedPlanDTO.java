package projects.java.taskapi.models.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record GeneratedPlanDTO(
        String title,
        String subject,
        @JsonProperty("duration_weeks")
        int durationWeeks,
        String difficulty,
        String description,
        @JsonProperty("learning_outcomes")
        List<String> learningOutcomes,
        List<WeekPlanDTO> weeks,
        List<String> prerequisites,
        @JsonProperty("recommended_resources")
        List<String> recommendedResources
) {
}
