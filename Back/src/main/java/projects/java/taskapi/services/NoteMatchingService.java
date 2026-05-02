package projects.java.taskapi.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import projects.java.taskapi.models.Note;
import projects.java.taskapi.models.dto.ai.NoteContextDTO;
import projects.java.taskapi.repositories.NoteRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NoteMatchingService {

    private static final int MAX_NOTES = 10;

    private final NoteRepository noteRepository;

    /**
     * Automatically selects the most relevant notes for plan generation
     * based on user-provided topics and optional subject filter.
     *
     * Scoring:
     *   +3 per keyword match between topic words and note keywords
     *   +2 if note belongs to the requested subject
     */
    // todo: подумать над добавлением учитывания рейтинга конспекта при выборе наиболее подходящих
    public List<NoteContextDTO> findRelevantNotes(List<String> topics, Long subjectId, Long userId) {
        if ((topics == null || topics.isEmpty()) && subjectId == null) {
            log.debug("No topics or subjectId provided — skipping note matching");
            return List.of();
        }

        List<String> searchKeywords = normalizeTopics(topics);
        Map<Note, Integer> scores = new LinkedHashMap<>();

        // Score by keyword overlap
        if (!searchKeywords.isEmpty()) {
            // fixme: сейчас конспекты выбираются только из тех что принадлежат переданному пользователю
            //  -> нужно чтоб выбор был из всех что есть
            List<Note> byKeywords = noteRepository.findByUserIdAndKeywordsIn(userId, searchKeywords);
            for (Note note : byKeywords) {
                long matches = note.getKeywords().stream()
                        .filter(k -> searchKeywords.contains(k.getWord().toLowerCase()))
                        .count();
                scores.merge(note, (int) matches * 3, Integer::sum);
            }
        }

        // Bonus for subject match
        if (subjectId != null) {
            List<Note> bySubject = noteRepository.findByUserIdAndSubjectId(userId, subjectId);
            for (Note note : bySubject) {
                scores.merge(note, 2, Integer::sum);
            }
        }

        List<NoteContextDTO> result = scores.entrySet().stream()
                .sorted(Map.Entry.<Note, Integer>comparingByValue().reversed())
                .limit(MAX_NOTES)
                .map(e -> toContextDTO(e.getKey()))
                .collect(Collectors.toList());

        log.info("Auto-selected {} notes for plan generation (topics={}, subjectId={})",
                result.size(), topics, subjectId);
        return result;
    }

    private List<String> normalizeTopics(List<String> topics) {
        if (topics == null) return List.of();
        return topics.stream()
                .flatMap(t -> Arrays.stream(t.toLowerCase().trim().split("\\s+")))
                .filter(w -> w.length() > 2)
                .distinct()
                .collect(Collectors.toList());
    }

    private NoteContextDTO toContextDTO(Note note) {
        List<String> keywords = note.getKeywords() == null ? List.of()
                : note.getKeywords().stream()
                        .map(k -> k.getWord())
                        .collect(Collectors.toList());

        return new NoteContextDTO(
                note.getId(),
                note.getTitle(),
                note.getSummary(),
                keywords,
                note.getDifficulty() != null ? note.getDifficulty() : "intermediate"
        );
    }
}
