package projects.java.notificationservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import projects.java.notificationservice.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
