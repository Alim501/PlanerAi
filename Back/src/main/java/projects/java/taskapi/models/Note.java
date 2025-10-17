package projects.java.taskapi.models;

import jakarta.persistence.*;
import lombok.*;
import projects.java.taskapi.models.enums.NoteFormat;
import projects.java.taskapi.models.enums.Subject;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private Subject subject;

    @Column(updatable = false)
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    private NoteFormat format;

    private String summary;

    private String keywords;

    @ManyToOne
    private User user;

    @ManyToMany(mappedBy = "relatedNotes")
    private List<Task> tasks;

    private LocalDateTime createdAt;

    @PrePersist
    private void prePersist(){
        this.createdAt = LocalDateTime.now();
    }
}

