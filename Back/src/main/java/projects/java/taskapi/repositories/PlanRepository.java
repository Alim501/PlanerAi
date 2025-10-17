package projects.java.taskapi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import projects.java.taskapi.models.Plan;
import projects.java.taskapi.models.enums.Subject;

import java.util.List;

public interface PlanRepository extends JpaRepository<Plan, Long> {
    List<Plan> findByTitleContainingIgnoreCase(String title);
    List<Plan> findBySubject(Subject subject);
    List<Plan> findByTitleContainingIgnoreCaseAndSubject(String title, Subject subject);
}

