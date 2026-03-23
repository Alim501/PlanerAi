package projects.java.taskapi.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
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

    @Column(columnDefinition = "TEXT")
    private String summary;

    private String difficulty;

    private String language;

    @ManyToMany
    @JoinTable(
            name = "note_keywords",
            joinColumns = @JoinColumn(name = "note_id"),
            inverseJoinColumns = @JoinColumn(name = "keyword_id")
    )
    private List<Keyword> keywords;

    @Column(nullable = false)
    private Integer viewCount;

    @OneToMany(mappedBy = "note", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NoteRating> ratings;

    // Cached values for performance
    private Double averageRating;
    private Integer ratingCount;

    @ManyToOne
    private User user;

    @ManyToMany(mappedBy = "relatedNotes")
    private List<Task> tasks;

    private LocalDateTime createdAt;

    @PrePersist
    private void prePersist(){
        this.createdAt = LocalDateTime.now();
        if (this.viewCount == null) {
            this.viewCount = 0;
        }
    }


    /// Helpers

    // Helper method to increment views
    public void incrementViewCount() {
        this.viewCount = (this.viewCount == null ? 0 : this.viewCount) + 1;
    }

    // Update cache whenever ratings change
    public void updateRatingCache() {
        if (ratings == null || ratings.isEmpty()) {
            this.averageRating = null;
            this.ratingCount = 0;
            return;
        }
        this.ratingCount = ratings.size();
        this.averageRating = ratings.stream()
                .mapToInt(NoteRating::getRating)
                .average()
                .orElse(0.0);
    }
}

