package projects.java.taskapi.models;

import jakarta.persistence.*;
import lombok.*;
import projects.java.taskapi.models.enums.PlanStatus;

import java.time.LocalDate;

@Data
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserPlanProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "study_plan_id")
    private Plan studyPlan;

    private LocalDate startDate;

    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private PlanStatus status;

    private double progress;

    @PrePersist
    private void prePersist() {
        this.status = PlanStatus.ACTIVE;
    }
}
