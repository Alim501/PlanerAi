package projects.java.taskapi.models.dto;

import java.time.LocalDate;
import java.util.List;

public record PlanDTO (
        String title,
        Long subjectId,
        LocalDate startDate,
        LocalDate endDate,
        List<TaskDTO> tasks
) {
}
