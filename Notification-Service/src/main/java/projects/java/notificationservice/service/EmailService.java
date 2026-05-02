package projects.java.notificationservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import projects.java.notificationservice.model.NotificationEvent;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    public void send(NotificationEvent event) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(event.getUserEmail());
            message.setSubject(event.getTitle());
            message.setText(event.getMessage());
            mailSender.send(message);
            log.info("Email sent to {}: {}", event.getUserEmail(), event.getTitle());
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", event.getUserEmail(), e.getMessage());
        }
    }
}
