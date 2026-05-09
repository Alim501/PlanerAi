package projects.java.taskapi.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import projects.java.taskapi.models.Notification;
import projects.java.taskapi.models.User;
import projects.java.taskapi.services.NotificationService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "User notification management")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Получить уведомления текущего пользователя")
    public ResponseEntity<List<Notification>> getNotifications(
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(notificationService.getNotifications(currentUser.getId(), unreadOnly));
    }

    @GetMapping("/count")
    @Operation(summary = "Количество непрочитанных уведомлений")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread(currentUser.getId())));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Отметить уведомление как прочитанное")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id,
                                                    @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(notificationService.markAsRead(id, currentUser.getId()));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Отметить все уведомления как прочитанные")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal User currentUser) {
        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
