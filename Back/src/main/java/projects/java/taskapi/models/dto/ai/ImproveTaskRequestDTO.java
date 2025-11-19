package projects.java.taskapi.models.dto.ai;

import jakarta.validation.constraints.NotBlank;

public record ImproveTaskRequestDTO(
        @NotBlank(message = "Task title is required")
        String taskTitle,

        String taskDescription,

        @NotBlank(message = "Subject is required")
        String subject
) {
}
