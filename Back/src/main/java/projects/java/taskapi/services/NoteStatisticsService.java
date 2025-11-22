package projects.java.taskapi.services;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projects.java.taskapi.exceptions.NoteNotFoundException;
import projects.java.taskapi.exceptions.UserNotFoundException;
import projects.java.taskapi.models.Note;
import projects.java.taskapi.models.NoteRating;
import projects.java.taskapi.models.User;
import projects.java.taskapi.repositories.NoteRatingRepository;
import projects.java.taskapi.repositories.NoteRepository;
import projects.java.taskapi.repositories.UserRepository;


@Service
@RequiredArgsConstructor
public class NoteStatisticsService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final NoteRatingRepository noteRatingRepository;

    @Transactional
    public Note incrementNoteViews(Long noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new NoteNotFoundException(noteId));
        note.incrementViewCount();
        return noteRepository.save(note);
    }

    public Integer getUserRating(Long noteId, Long userId) {
        return noteRatingRepository
                .findByNoteIdAndUserId(noteId, userId)
                .map(NoteRating::getRating)
                .orElse(null);
    }

    @Transactional
    public Note rateNote(Long noteId, Long userId, Integer rating) {
        // 1. Validate rating (1-5)
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be 1-5");
        }

        // 2. Find note and user
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new NoteNotFoundException(noteId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // 3. Check for existing rating by this user
        NoteRating userRating = noteRatingRepository
                .findByNoteIdAndUserId(noteId, userId)
                .orElse(null);

        if (userRating != null) {
            // Update existing rating
            userRating.setRating(rating);
            noteRatingRepository.save(userRating);
        } else {
            // Create new rating
            NoteRating newRating = NoteRating.builder()
                    .note(note)
                    .user(user)
                    .rating(rating)
                    .build();
            noteRatingRepository.save(newRating);
        }

        // 4. Refresh note's ratings and update cache
        note = noteRepository.findById(noteId).orElseThrow();
        note.updateRatingCache();
        return noteRepository.save(note);
    }
}
