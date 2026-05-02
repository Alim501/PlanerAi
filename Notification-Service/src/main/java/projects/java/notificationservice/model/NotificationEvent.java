package projects.java.notificationservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
