package projects.java.taskapi.models.dto.ai;

import jakarta.validation.constraints.NotNull;

public record AnalyzeNoteRequestDTO(
        @NotNull(message = "Note ID is required")
        Long noteId
) {
}
