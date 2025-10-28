package projects.java.taskapi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import projects.java.taskapi.models.Note;
import projects.java.taskapi.models.Subject;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserId(Long userId);
    List<Note> findBySubjectId(Long subjectId);
    List<Note> findByUserIdAndSubject(Long userId, Subject subject);
    @Query("SELECT DISTINCT n FROM Note n JOIN n.keywords k WHERE LOWER(k.word) IN :keywords")
    List<Note> findByKeywordsIn(@Param("keywords") List<String> keywords);

}
