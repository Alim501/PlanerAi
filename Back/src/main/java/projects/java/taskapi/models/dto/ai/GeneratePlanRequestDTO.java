package projects.java.taskapi.models.dto.ai;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record GeneratePlanRequestDTO(
        @NotBlank(message = "Subject is required")
        String subject,

        @Min(value = 1, message = "Duration must be at least 1 week")
        @Max(value = 52, message = "Duration cannot exceed 52 weeks")
        int durationWeeks,

        String level,  // beginner, intermediate, advanced

        List<String> topics,

        String goals
) {
}
