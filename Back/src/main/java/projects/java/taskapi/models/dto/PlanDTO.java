package projects.java.taskapi.models.dto;

import projects.java.taskapi.models.enums.Subject;

import java.time.LocalDate;
import java.util.List;

public record PlanDTO (
        String title,
        Subject subject,
        LocalDate startDate,
        LocalDate endDate,
        Long userId,
        List<TaskDTO> tasks
) {
}
