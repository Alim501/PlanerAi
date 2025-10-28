package projects.java.taskapi.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import projects.java.taskapi.models.enums.NoteFormat;

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

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @Column(updatable = false)
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    private NoteFormat format;

    private String summary;

    @ManyToMany
    @JoinTable(
            name = "note_keywords",
            joinColumns = @JoinColumn(name = "note_id"),
            inverseJoinColumns = @JoinColumn(name = "keyword_id")
    )
    private List<Keyword> keywords;

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

