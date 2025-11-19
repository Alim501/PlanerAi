package projects.java.taskapi.models.dto.ai;

import jakarta.validation.constraints.NotBlank;

public record AnalyzeNoteRequestDTO(
        @NotBlank(message = "File path is required")
        String filePath,

        @NotBlank(message = "File type is required")
        String fileType,

        Long subjectId
) {
}
