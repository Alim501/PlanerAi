package projects.java.taskapi.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projects.java.taskapi.models.User;
import projects.java.taskapi.services.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Получить данные пользователя по ID")
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Обновить имя и фамилию пользователя")
    @PutMapping("/{userId}/update-profile")
    public ResponseEntity<User> updateProfile(@PathVariable Long userId,
                                              @RequestParam String firstName,
                                              @RequestParam String lastName) {
        User updated = userService.updateProfile(userId, firstName, lastName);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Изменить пароль пользователя")
    @PutMapping("/{userId}/change-password")
    public ResponseEntity<String> changePassword(@PathVariable Long userId,
                                                 @RequestParam String oldPassword,
                                                 @RequestParam String newPassword) {
        userService.changePassword(userId, oldPassword, newPassword);
        return ResponseEntity.ok("Пароль успешно изменён");
    }
}
