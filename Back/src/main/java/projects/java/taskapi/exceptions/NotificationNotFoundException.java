package projects.java.taskapi.exceptions;

public class NotificationNotFoundException extends RuntimeException {
    public NotificationNotFoundException(Long id) {
        super(String.format("Notification with id: %d not found", id));
    }
}
