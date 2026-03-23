package projects.java.taskapi.models.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record NoteAnalysisDTO(
        String summary,
        @JsonProperty("key_concepts") List<String> keyConcepts,
        String difficulty,
        @JsonProperty("word_count") Integer wordCount,
        String language
) {
}
