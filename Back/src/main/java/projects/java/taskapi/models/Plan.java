package projects.java.taskapi.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

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

    private String description;

    private String difficulty;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @JsonIgnore
    @OneToMany(mappedBy = "studyPlan", cascade = CascadeType.ALL)
    private List<UserPlanProgress> userPlans;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL)
    private List<Week> weeks;
}
