package projects.java.taskapi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import projects.java.taskapi.models.Week;

import java.util.List;

public interface WeekRepository extends JpaRepository<Week, Long> {
    List<Week> findByPlanIdOrderByWeekNumber(Long planId);
}
