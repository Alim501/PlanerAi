package projects.java.taskapi.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import projects.java.taskapi.models.enums.PlanStatus;

import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    private LocalDate startDate;

    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private PlanStatus status;

    @JsonIgnore
    @OneToMany(mappedBy = "studyPlan", cascade = CascadeType.ALL)
    private List<UserPlanProgress> userPlans;

    @OneToMany(mappedBy = "studyPlan", cascade = CascadeType.ALL)
    private List<Task> tasks;

    @PrePersist
    private void prePersist(){
        this.status = PlanStatus.ACTIVE;
    }
}
