package projects.java.taskapi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import projects.java.taskapi.models.Plan;
import projects.java.taskapi.models.UserPlanProgress;
import projects.java.taskapi.models.enums.PlanStatus;

import java.time.LocalDate;
import java.util.List;

public interface ProgressRepository extends JpaRepository<UserPlanProgress, Long> {

    @Query("SELECT upp.studyPlan FROM UserPlanProgress upp WHERE upp.user.id = :userId")
    List<Plan> findPlansByUserId(@Param("userId") Long userId);

    @Query("SELECT upp FROM UserPlanProgress upp JOIN FETCH upp.user u WHERE upp.studyPlan.id = :planId AND upp.status = :status")
    List<UserPlanProgress> findActiveSubscribersByPlanId(@Param("planId") Long planId, @Param("status") PlanStatus status);

    @Query("SELECT upp FROM UserPlanProgress upp JOIN FETCH upp.user u JOIN FETCH upp.studyPlan p WHERE upp.endDate = :date AND upp.status = :status")
    List<UserPlanProgress> findByEndDateAndStatus(@Param("date") LocalDate date, @Param("status") PlanStatus status);
}
