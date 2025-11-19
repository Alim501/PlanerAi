package projects.java.taskapi.models.dto.ai;

import java.util.List;

public record TaskImprovementDTO(
        String improvedTitle,
        String improvedDescription,
        List<String> suggestions,
        String estimatedTime,
        String difficulty
) {
}
