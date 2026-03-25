package projects.java.taskapi.models.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record TaskPlanDTO(
        String title,
        String description,
        @JsonProperty("internal_note_ids") List<Long> internalNoteIds,
        @JsonProperty("external_resources") List<String> externalResources
) {
}
