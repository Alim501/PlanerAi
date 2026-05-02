package projects.java.notificationservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import projects.java.notificationservice.model.Notification;
import projects.java.notificationservice.model.NotificationEvent;
import projects.java.notificationservice.repository.NotificationRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPersistenceService {

    private final NotificationRepository repository;

    public void save(NotificationEvent event) {
        Notification notification = Notification.builder()
                .userId(event.getUserId())
                .type(event.getType())
                .title(event.getTitle())
                .message(event.getMessage())
                .link(event.getLink())
                .isRead(false)
                .build();
        repository.save(notification);
        log.debug("Notification saved for userId={} type={}", event.getUserId(), event.getType());
    }
}
