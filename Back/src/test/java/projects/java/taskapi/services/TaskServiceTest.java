package projects.java.taskapi.services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import projects.java.taskapi.exceptions.TaskNotFoundException;
import projects.java.taskapi.models.Task;
import projects.java.taskapi.models.dto.TaskDTO;
import projects.java.taskapi.models.enums.TaskStatus;
import projects.java.taskapi.repositories.TaskRepository;
import projects.java.taskapi.repositories.WeekRepository;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock private TaskRepository taskRepository;
    @Mock private WeekRepository weekRepository;

    @InjectMocks private TaskService taskService;

    // ── updateTaskStatus: DONE ───────────────────────────────────────────────

    @Test
    void updateTaskStatus_toCompleted_updatesStatusAndReturnsTask() {
        // Arrange
        Long taskId = 1L;
        Task existing = Task.builder()
                .id(taskId).title("Read chapter").taskStatus(TaskStatus.PENDING).build();
        Task updated = Task.builder()
                .id(taskId).title("Read chapter").taskStatus(TaskStatus.DONE).build();

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(existing));
        when(taskRepository.save(any(Task.class))).thenReturn(updated);

        // Act
        Task result = taskService.updateTaskStatus(taskId, TaskStatus.DONE);

        // Assert
        assertThat(result.getTaskStatus()).isEqualTo(TaskStatus.DONE);
        verify(taskRepository).findById(taskId);
        verify(taskRepository).save(any(Task.class));
    }

    // ── updateTask: non-existing id ──────────────────────────────────────────

    @Test
    void updateTask_withNonExistingId_throwsTaskNotFoundException() {
        // Arrange
        Long missingId = 999L;
        TaskDTO dto = new TaskDTO("Updated", "Updated desc", LocalDate.now());

        when(taskRepository.findById(missingId)).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(TaskNotFoundException.class,
                () -> taskService.updateTask(missingId, dto));
        verify(taskRepository, never()).save(any());
    }

    // ── updateTask: valid data ───────────────────────────────────────────────

    @Test
    void updateTask_withValidData_updatesFieldsAndReturnsTask() {
        // Arrange
        Long taskId = 1L;
        LocalDate newDeadline = LocalDate.of(2026, 12, 31);
        TaskDTO dto = new TaskDTO("New Title", "New description", newDeadline);

        Task existing = Task.builder()
                .id(taskId).title("Old Title").description("Old desc")
                .taskStatus(TaskStatus.IN_PROGRESS).build();
        Task persisted = Task.builder()
                .id(taskId).title("New Title").description("New description")
                .deadline(newDeadline).taskStatus(TaskStatus.IN_PROGRESS).build();

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(existing));
        when(taskRepository.save(any(Task.class))).thenReturn(persisted);

        // Act
        Task result = taskService.updateTask(taskId, dto);

        // Assert
        assertThat(result.getTitle()).isEqualTo("New Title");
        assertThat(result.getDescription()).isEqualTo("New description");
        assertThat(result.getDeadline()).isEqualTo(newDeadline);
        verify(taskRepository).save(any(Task.class));
    }
}