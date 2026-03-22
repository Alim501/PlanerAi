package projects.java.taskapi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import projects.java.taskapi.models.Subject;

import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findByNameIgnoreCase(String name);
}
