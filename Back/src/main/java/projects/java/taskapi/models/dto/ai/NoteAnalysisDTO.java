package projects.java.taskapi.models.dto.ai;

import java.util.List;

public record NoteAnalysisDTO(
        String summary,
        List<String> keyConcepts,
        List<String> topics,
        String difficulty,
        List<String> suggestedTags,
        Integer wordCount,
        String language
) {
}
