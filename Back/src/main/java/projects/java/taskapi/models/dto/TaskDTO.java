package projects.java.taskapi.models.dto;

import java.time.LocalDate;

public record TaskDTO(
        String title,
        String description,
        LocalDate dueDate
) {}
