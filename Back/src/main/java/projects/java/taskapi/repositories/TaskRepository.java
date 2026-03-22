package projects.java.taskapi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import projects.java.taskapi.models.Task;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByWeekId(Long weekId);
    List<Task> findByWeekPlanId(Long planId);
}
