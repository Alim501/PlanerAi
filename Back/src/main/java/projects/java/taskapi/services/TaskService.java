package projects.java.taskapi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projects.java.taskapi.exceptions.TaskNotFoundException;
import projects.java.taskapi.models.Task;
import projects.java.taskapi.models.Week;
import projects.java.taskapi.models.dto.TaskDTO;
import projects.java.taskapi.models.enums.TaskStatus;
import projects.java.taskapi.repositories.TaskRepository;
import projects.java.taskapi.repositories.WeekRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final WeekRepository weekRepository;

    public Task addTask(Long weekId, TaskDTO dto) {
        Week week = weekRepository.findById(weekId)
                .orElseThrow(() -> new IllegalArgumentException("Week not found: " + weekId));

        Task task = Task.builder()
                .title(dto.title())
                .description(dto.description())
                .week(week)
                .build();

        return taskRepository.save(task);
    }

    public List<Task> getTasksByWeek(Long weekId) {
        return taskRepository.findByWeekId(weekId);
    }

    public List<Task> getTasksByPlan(Long planId) {
        return taskRepository.findByWeekPlanId(planId);
    }

    public Optional<Task> getTaskById(Long taskId) {
        return taskRepository.findById(taskId);
    }

    public Task updateTask(Long taskId, TaskDTO dto) {
        return taskRepository.findById(taskId)
                .map(task -> {
                    task.setTitle(dto.title());
                    task.setDescription(dto.description());
                    return taskRepository.save(task);
                })
                .orElseThrow(() -> new TaskNotFoundException(taskId));
    }

    public Task updateTaskStatus(Long taskId, TaskStatus status) {
        return taskRepository.findById(taskId)
                .map(task -> {
                    task.setTaskStatus(status);
                    return taskRepository.save(task);
                })
                .orElseThrow(() -> new TaskNotFoundException(taskId));
    }

    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
    }
}
