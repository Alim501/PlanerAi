package projects.java.taskapi.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import projects.java.taskapi.models.Task;
import projects.java.taskapi.models.dto.TaskDTO;
import projects.java.taskapi.services.TaskService;

import java.util.List;

@RestController
@RequestMapping("api/plans")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @Operation(summary = "Добавить новую задачу в план")
    @PostMapping("/{planId}/tasks")
    public Task addTask(@PathVariable Long planId, @RequestBody TaskDTO taskDto) {
        return taskService.addTask(planId, taskDto);
    }

    @Operation(summary = "Получить все задачи для выбранного плана")
    @GetMapping("/{planId}/tasks")
    public List<Task> getTasks(@PathVariable Long planId) {
        return taskService.getTasksByPlan(planId);
    }

    @Operation(summary = "Получить задачу по её ID")
    @GetMapping("/tasks/{taskId}")
    public Task getTaskById(@PathVariable Long taskId) {
        return taskService.getTaskById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    @Operation(summary = "Обновить существующую задачу")
    @PutMapping("/tasks/{taskId}")
    public Task updateTask(@PathVariable Long taskId, @RequestBody Task task) {
        return taskService.updateTask(taskId, task);
    }

    @Operation(summary = "Удалить задачу по ID")
    @DeleteMapping("/tasks/{taskId}")
    public void deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
    }
}