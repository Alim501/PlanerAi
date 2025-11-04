package projects.java.taskapi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import projects.java.taskapi.models.NoteRating;

import java.util.List;
import java.util.Optional;

public interface NoteRatingRepository extends JpaRepository<NoteRating, Long> {
    Optional<NoteRating> findByNoteIdAndUserId(Long noteId, Long userId);
    List<NoteRating> findByNoteId(Long noteId);
}
