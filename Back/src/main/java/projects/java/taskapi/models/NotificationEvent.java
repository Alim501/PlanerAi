package projects.java.taskapi.models;

import lombok.*;
import projects.java.taskapi.models.enums.NotificationType;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationEvent {

    private String eventId;
    private NotificationType type;
    private Long userId;
    private String userEmail;
    private String title;
    private String message;
    private String link;
    private boolean notifyEmail;
    private boolean notifyInApp;
    private LocalDateTime occurredAt;
}
