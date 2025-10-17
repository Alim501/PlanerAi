package projects.java.taskapi.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import projects.java.taskapi.models.User;
import projects.java.taskapi.services.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
public class UserController {

    private final UserService userService;


    // методы скорее для роли Admin

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


    // методы для роли Student

    @Operation(summary = "Получить данные текущего пользователя (вытаскивает юзера из jwt)")
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Обновить имя и фамилию текущего пользователя")
    @PutMapping("/me/update-profile")
    public ResponseEntity<User> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                              @RequestParam String firstName,
                                              @RequestParam String lastName) {
        User updated = userService.updateProfile(userDetails.getUsername(), firstName, lastName);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Изменить пароль текущего пользователя")
    @PutMapping("/me/change-password")
    public ResponseEntity<String> changePassword(@AuthenticationPrincipal UserDetails userDetails,
                                                 @RequestParam String oldPassword,
                                                 @RequestParam String newPassword) {
        userService.changePassword(userDetails.getUsername(), oldPassword, newPassword);
        return ResponseEntity.ok("Пароль успешно изменён");
    }
}
