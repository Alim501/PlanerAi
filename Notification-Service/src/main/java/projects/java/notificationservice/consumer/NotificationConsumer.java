package projects.java.notificationservice.consumer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import projects.java.notificationservice.model.NotificationEvent;
import projects.java.notificationservice.service.EmailService;
import projects.java.notificationservice.service.NotificationPersistenceService;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final NotificationPersistenceService persistenceService;
    private final EmailService emailService;

    @KafkaListener(topics = "notification.events", groupId = "notification-service-group")
    public void consume(NotificationEvent event) {
        log.info("Received notification event: eventId={} type={} userId={}",
                event.getEventId(), event.getType(), event.getUserId());

        if (event.isNotifyInApp()) {
            persistenceService.save(event);
        }

        if (event.isNotifyEmail()) {
            emailService.send(event);
        }
    }
}
