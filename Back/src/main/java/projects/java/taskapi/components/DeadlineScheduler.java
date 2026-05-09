package projects.java.taskapi.components;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import projects.java.taskapi.models.NotificationEvent;
import projects.java.taskapi.models.Task;
import projects.java.taskapi.models.User;
import projects.java.taskapi.models.UserPlanProgress;
import projects.java.taskapi.models.enums.NotificationType;
import projects.java.taskapi.models.enums.PlanStatus;
import projects.java.taskapi.models.enums.TaskStatus;
import projects.java.taskapi.repositories.ProgressRepository;
import projects.java.taskapi.repositories.TaskRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;

@Component
@RequiredArgsConstructor
@Slf4j
public class DeadlineScheduler {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    private final TaskRepository taskRepository;
    private final ProgressRepository progressRepository;
    private final KafkaNotificationProducer producer;

    @Scheduled(cron = "${scheduler.task-deadlines.cron}")
    public void checkTaskDeadlines() {
        LocalDate today = LocalDate.now();
        log.info("Running task deadline check for date {}", today);

        sendTaskNotifications(
                taskRepository.findByDeadlineAndStatusNot(today.plusDays(3), TaskStatus.DONE),
                NotificationType.DEADLINE_WARNING,
                "Дедлайн задачи через 3 дня",
                task -> "Задача «" + task.getTitle() + "» истекает " + task.getDeadline().format(DATE_FORMATTER)
        );

        sendTaskNotifications(
                taskRepository.findByDeadlineAndStatusNot(today, TaskStatus.DONE),
                NotificationType.DEADLINE_URGENT,
                "Дедлайн задачи сегодня",
                task -> "Задача «" + task.getTitle() + "» истекает сегодня"
        );

        sendTaskNotifications(
                taskRepository.findOverdue(today, TaskStatus.DONE),
                NotificationType.TASK_OVERDUE,
                "Просроченная задача",
                task -> "Задача «" + task.getTitle() + "» просрочена (" + task.getDeadline().format(DATE_FORMATTER) + ")"
        );
    }

    @Scheduled(cron = "${scheduler.plan-end-dates.cron}")
    public void checkPlanEndDates() {
        LocalDate warnDate = LocalDate.now().plusDays(3);
        log.info("Running plan end-date check for date {}", warnDate);

        List<UserPlanProgress> ending = progressRepository.findByEndDateAndStatus(warnDate, PlanStatus.ACTIVE);
        for (UserPlanProgress progress : ending) {
            User user = progress.getUser();
            boolean sendEmail = Boolean.TRUE.equals(user.getNotifyEmail());
            boolean sendInApp  = Boolean.TRUE.equals(user.getNotifyInApp());
            if (!sendEmail && !sendInApp) continue;

            NotificationEvent event = NotificationEvent.builder()
                    .eventId(UUID.randomUUID().toString())
                    .type(NotificationType.PLAN_ENDING)
                    .userId(user.getId())
                    .userEmail(user.getEmail())
                    .title("Учебный план заканчивается через 3 дня")
                    .message("Ваш план «" + progress.getStudyPlan().getTitle()
                            + "» завершается " + progress.getEndDate().format(DATE_FORMATTER))
                    .link("/plans/" + progress.getStudyPlan().getId())
                    .notifyEmail(sendEmail)
                    .notifyInApp(sendInApp)
                    .occurredAt(LocalDateTime.now())
                    .build();

            producer.sendNotification(event);
        }
    }

    private void sendTaskNotifications(List<Task> tasks, NotificationType type, String title,
                                        Function<Task, String> messageBuilder) {
        for (Task task : tasks) {
            Long planId = task.getWeek().getPlan().getId();
            List<UserPlanProgress> subscribers =
                    progressRepository.findActiveSubscribersByPlanId(planId, PlanStatus.ACTIVE);

            for (UserPlanProgress progress : subscribers) {
                User user = progress.getUser();
                boolean sendEmail = Boolean.TRUE.equals(user.getNotifyEmail());
                boolean sendInApp  = Boolean.TRUE.equals(user.getNotifyInApp());
                if (!sendEmail && !sendInApp) continue;

                NotificationEvent event = NotificationEvent.builder()
                        .eventId(UUID.randomUUID().toString())
                        .type(type)
                        .userId(user.getId())
                        .userEmail(user.getEmail())
                        .title(title)
                        .message(messageBuilder.apply(task))
                        .link("/plans/" + planId)
                        .notifyEmail(sendEmail)
                        .notifyInApp(sendInApp)
                        .occurredAt(LocalDateTime.now())
                        .build();

                producer.sendNotification(event);
            }
        }
    }
}
