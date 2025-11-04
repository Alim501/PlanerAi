package projects.java.taskapi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projects.java.taskapi.exceptions.PlanNotFoundException;
import projects.java.taskapi.models.Plan;
import projects.java.taskapi.models.Task;
import projects.java.taskapi.models.dto.TaskDTO;
import projects.java.taskapi.repositories.PlanRepository;
import projects.java.taskapi.repositories.TaskRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final PlanRepository planRepository;

    public Task addTask(Long planId, TaskDTO taskDto) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new PlanNotFoundException(planId));

        Task task = Task.builder()
                .title(taskDto.title())
                .description(taskDto.description())
                .dueDate(taskDto.dueDate())
                .build();

        task.setStudyPlan(plan);
        return taskRepository.save(task);
    }

    public List<Task> getTasksByPlan(Long planId) {
        return taskRepository.findByStudyPlanId(planId);
    }

    public Task updateTask(Long taskId, Task updatedTask) {
        return taskRepository.findById(taskId)
                .map(task -> {
                    task.setTitle(updatedTask.getTitle());
                    task.setDescription(updatedTask.getDescription());
                    task.setDueDate(updatedTask.getDueDate());
                    return taskRepository.save(task);
                })
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
    }

    public Optional<Task> getTaskById(Long taskId) {
        return taskRepository.findById(taskId);
    }

}
