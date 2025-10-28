package projects.java.taskapi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import projects.java.taskapi.models.Plan;
import projects.java.taskapi.models.Subject;

import java.util.List;

public interface PlanRepository extends JpaRepository<Plan, Long> {
    List<Plan> findByTitleContainingIgnoreCase(String title);
    List<Plan> findBySubjectId(Long subjectId);
    List<Plan> findByTitleContainingIgnoreCaseAndSubjectId(String title, Long subjectId);
}

