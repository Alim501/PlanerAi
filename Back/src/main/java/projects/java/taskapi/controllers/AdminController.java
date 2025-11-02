package projects.java.taskapi.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import projects.java.taskapi.models.User;
import projects.java.taskapi.models.enums.RoleName;
import projects.java.taskapi.services.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
//@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;

    // пока что пропускает всех

    @Operation(summary = "Получить данные пользователя по ID")
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Обновить имя и фамилию пользователя по ID")
    @PutMapping("/{userId}/update-profile")
    public ResponseEntity<User> updateProfile(@PathVariable Long userId,
                                              @RequestParam String firstName,
                                              @RequestParam String lastName) {
        User updated = userService.updateProfile(userId, firstName, lastName);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Изменить пароль пользователя по ID")
    @PutMapping("/{userId}/change-password")
    public ResponseEntity<String> changePassword(@PathVariable Long userId,
                                                 @RequestParam String oldPassword,
                                                 @RequestParam String newPassword) {
        userService.changePassword(userId, oldPassword, newPassword);
        return ResponseEntity.ok("Пароль успешно изменён");
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/{userId}/role/{roleName}")
    public ResponseEntity<User> addRoleToUser(
            @PathVariable Long userId,
            @PathVariable RoleName roleName) {
        return ResponseEntity.ok(userService.addRoleToUser(userId, roleName));
    }

    @DeleteMapping("/{userId}/role/{roleName}")
    public ResponseEntity<User> removeRoleFromUser(
            @PathVariable Long userId,
            @PathVariable RoleName roleName) {
        return ResponseEntity.ok(userService.removeRoleFromUser(userId, roleName));
    }
}
