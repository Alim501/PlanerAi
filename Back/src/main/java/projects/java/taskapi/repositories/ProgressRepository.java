package projects.java.taskapi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import projects.java.taskapi.models.Plan;
import projects.java.taskapi.models.UserPlanProgress;

import java.util.List;

public interface ProgressRepository extends JpaRepository<UserPlanProgress, Long> {
    @Query("SELECT upp.studyPlan FROM UserPlanProgress upp WHERE upp.user.id = :userId")
    List<Plan> findPlansByUserId(@Param("userId") Long userId);
}
