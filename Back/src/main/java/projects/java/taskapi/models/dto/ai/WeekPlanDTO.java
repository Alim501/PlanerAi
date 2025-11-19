package projects.java.taskapi.models.dto.ai;

import java.util.List;

public record WeekPlanDTO(
        int weekNumber,
        String title,
        List<String> topics,
        List<String> tasks,
        int estimatedHours,
        List<String> resources
) {
}
