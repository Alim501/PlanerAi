package projects.java.taskapi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import projects.java.taskapi.models.Task;
import projects.java.taskapi.models.enums.TaskStatus;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByWeekId(Long weekId);

    List<Task> findByWeekPlanId(Long planId);

    @Query("SELECT t FROM Task t JOIN FETCH t.week w JOIN FETCH w.plan p WHERE t.deadline = :deadline AND t.taskStatus <> :status")
    List<Task> findByDeadlineAndStatusNot(@Param("deadline") LocalDate deadline, @Param("status") TaskStatus status);

    @Query("SELECT t FROM Task t JOIN FETCH t.week w JOIN FETCH w.plan p WHERE t.deadline < :today AND t.taskStatus <> :status")
    List<Task> findOverdue(@Param("today") LocalDate today, @Param("status") TaskStatus status);
}
