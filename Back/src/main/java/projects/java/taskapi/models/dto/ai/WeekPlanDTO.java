package projects.java.taskapi.models.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record WeekPlanDTO(
        @JsonProperty("week_number") int weekNumber,
        String title,
        List<TaskPlanDTO> tasks,
        @JsonProperty("estimated_hours") int estimatedHours,
        List<String> resources
) {
}
