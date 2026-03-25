package projects.java.taskapi.models.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record NoteContextDTO(
        @JsonProperty("note_id") Long noteId,
        String title,
        String summary,
        List<String> keywords,
        String difficulty
) {
}
