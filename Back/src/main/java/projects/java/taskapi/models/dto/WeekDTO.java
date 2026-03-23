package projects.java.taskapi.models.dto;

import java.util.List;

public record WeekDTO(
        int weekNumber,
        String title,
        int estimatedHours,
        List<TaskDTO> tasks
) {
}
