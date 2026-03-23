package projects.java.taskapi.exceptions;

public class TaskNotFoundException extends RuntimeException {
    public TaskNotFoundException(Long taskId) {
        super(String.format("Task with id: %d not found", taskId));
    }
}
