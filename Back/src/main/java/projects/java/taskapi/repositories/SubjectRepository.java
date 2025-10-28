package projects.java.taskapi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import projects.java.taskapi.models.Subject;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
}
