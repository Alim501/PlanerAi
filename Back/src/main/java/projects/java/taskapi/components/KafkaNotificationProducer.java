package projects.java.taskapi.components;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import projects.java.taskapi.models.NotificationEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaNotificationProducer {

    private static final String TOPIC = "notification.events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendNotification(NotificationEvent event) {
        try {
            kafkaTemplate.send(TOPIC, event.getEventId(), event)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.error("Failed to send notification event {}: {}", event.getEventId(), ex.getMessage());
                        } else {
                            log.debug("Notification event {} sent to topic {}", event.getEventId(), TOPIC);
                        }
                    });
        } catch (Exception e) {
            log.error("Failed to send notification event {}: {}", event.getEventId(), e.getMessage());
        }
    }
}
