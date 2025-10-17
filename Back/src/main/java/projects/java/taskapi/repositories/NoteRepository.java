package projects.java.taskapi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import projects.java.taskapi.models.Note;
import projects.java.taskapi.models.enums.Subject;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserId(Long userId);
    List<Note> findBySubject(Subject subject);
    List<Note> findByUserIdAndSubject(Long userId, Subject subject);
}
