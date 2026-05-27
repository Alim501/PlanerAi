package projects.java.taskapi.services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import projects.java.taskapi.exceptions.SubjectNotFoundException;
import projects.java.taskapi.exceptions.UserNotFoundException;
import projects.java.taskapi.models.*;
import projects.java.taskapi.models.dto.PlanDTO;
import projects.java.taskapi.models.dto.WeekDTO;
import projects.java.taskapi.models.dto.TaskDTO;
import projects.java.taskapi.models.dto.ai.GeneratedPlanDTO;
import projects.java.taskapi.models.dto.ai.TaskPlanDTO;
import projects.java.taskapi.models.dto.ai.WeekPlanDTO;
import projects.java.taskapi.repositories.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlanServiceTest {

    @Mock private PlanRepository planRepository;
    @Mock private ProgressRepository progressRepository;
    @Mock private UserRepository userRepository;
    @Mock private SubjectRepository subjectRepository;
    @Mock private NoteRepository noteRepository;

    @InjectMocks private PlanService planService;

    // ── createPlan: happy path ───────────────────────────────────────────────

    @Test
    void createPlan_withValidRequest_returnsSavedPlan() {
        // Arrange
        Long userId = 1L;
        Long subjectId = 2L;

        User user = User.builder().id(userId).email("user@test.com").build();
        Subject subject = Subject.builder().id(subjectId).name("Mathematics").build();
        Plan savedPlan = Plan.builder().id(10L).title("Math Plan").subject(subject)
                .description("desc").difficulty("easy").build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(subjectRepository.findById(subjectId)).thenReturn(Optional.of(subject));
        when(planRepository.save(any(Plan.class))).thenReturn(savedPlan);

        PlanDTO dto = new PlanDTO(
                "Math Plan", subjectId, "desc", "easy",
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 6, 1),
                List.of(new WeekDTO(1, "Week 1", 8, List.of(new TaskDTO("T1", "d", null))))
        );

        // Act
        Plan result = planService.createPlan(userId, dto);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getTitle()).isEqualTo("Math Plan");
        verify(planRepository).save(any(Plan.class));
        verify(progressRepository).save(any(UserPlanProgress.class));
    }

    // ── createPlan: subject missing ─────────────────────────────────────────

    @Test
    void createPlan_whenSubjectNotFound_throwsSubjectNotFoundException() {
        // Arrange
        Long userId = 1L;
        Long missingSubjectId = 99L;

        User user = User.builder().id(userId).email("user@test.com").build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(subjectRepository.findById(missingSubjectId)).thenReturn(Optional.empty());

        PlanDTO dto = new PlanDTO(
                "Plan", missingSubjectId, "desc", "easy",
                LocalDate.now(), LocalDate.now().plusWeeks(4), null
        );

        // Act + Assert
        assertThrows(SubjectNotFoundException.class,
                () -> planService.createPlan(userId, dto));
        verify(planRepository, never()).save(any());
    }

    // ── createPlanFromGenerated: referenced notes absent ────────────────────

    @Test
    void createPlanFromGenerated_whenInternalNotesNotFound_createsPlanWithEmptyRelatedNotes() {
        // Arrange
        Long userId = 1L;
        User user = User.builder().id(userId).email("user@test.com").build();
        Subject subject = Subject.builder().id(1L).name("Physics").build();
        Plan savedPlan = Plan.builder().id(5L).title("Physics Plan").subject(subject).build();

        TaskPlanDTO taskDto = new TaskPlanDTO(
                "Study Newton", "Learn mechanics",
                List.of(999L, 998L),        // IDs that will not be found in DB
                List.of("https://resource.example.com")
        );
        WeekPlanDTO weekDto = new WeekPlanDTO(1, "Mechanics Week", List.of(taskDto), 10, List.of());
        GeneratedPlanDTO dto = new GeneratedPlanDTO(
                "Physics Plan", "Physics", 4, "medium", "Learn physics",
                List.of(), List.of(weekDto), List.of(), List.of()
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(subjectRepository.findByNameIgnoreCase("Physics")).thenReturn(Optional.of(subject));
        when(noteRepository.findAllById(anyIterable())).thenReturn(List.of()); // no matches
        when(planRepository.save(any(Plan.class))).thenReturn(savedPlan);

        // Act
        Plan result = planService.createPlanFromGenerated(userId, dto);

        // Assert
        assertThat(result).isNotNull();
        // noteRepository must have been queried for the referenced IDs
        verify(noteRepository).findAllById(anyIterable());
        verify(planRepository).save(any(Plan.class));
    }
}
