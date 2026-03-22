package projects.java.taskapi.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import projects.java.taskapi.models.enums.TaskStatus;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    private TaskStatus taskStatus;

    private LocalDateTime createdAt;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "week_id")
    private Week week;

    @ManyToMany
    @JoinTable(
            name = "tasks_notes",
            joinColumns = @JoinColumn(name = "task_id"),
            inverseJoinColumns = @JoinColumn(name = "note_id")
    )
    private List<Note> relatedNotes;

    @PrePersist
    private void prePersist() {
        this.taskStatus = TaskStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }
}
