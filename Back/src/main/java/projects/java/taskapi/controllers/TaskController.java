package projects.java.taskapi.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projects.java.taskapi.exceptions.TaskNotFoundException;
import projects.java.taskapi.models.Task;
import projects.java.taskapi.models.dto.TaskDTO;
import projects.java.taskapi.services.TaskService;

import java.util.List;

@RestController
@RequestMapping("api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task management within study plan weeks")
public class TaskController {

    private final TaskService taskService;

    @Operation(summary = "Добавить задачу в неделю плана")
    @PostMapping
    public Task addTask(@RequestParam Long weekId, @RequestBody TaskDTO dto) {
        return taskService.addTask(weekId, dto);
    }

    @Operation(summary = "Получить все задачи для недели")
    @GetMapping("/week/{weekId}")
    public List<Task> getTasksByWeek(@PathVariable Long weekId) {
        return taskService.getTasksByWeek(weekId);
    }

    @Operation(summary = "Получить все задачи плана")
    @GetMapping("/plan/{planId}")
    public List<Task> getTasksByPlan(@PathVariable Long planId) {
        return taskService.getTasksByPlan(planId);
    }

    @Operation(summary = "Получить задачу по ID")
    @GetMapping("/{taskId}")
    public Task getTaskById(@PathVariable Long taskId) {
        return taskService.getTaskById(taskId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));
    }

    @Operation(summary = "Обновить задачу")
    @PutMapping("/{taskId}")
    public Task updateTask(@PathVariable Long taskId, @RequestBody TaskDTO dto) {
        return taskService.updateTask(taskId, dto);
    }

    @Operation(summary = "Удалить задачу по ID")
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }
}
