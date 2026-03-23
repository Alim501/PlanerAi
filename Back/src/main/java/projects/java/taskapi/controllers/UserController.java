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
public class UserController {

    private final UserService userService;

    // методы для роли STUDENT и MODERATOR

    // todo: во всех методах где получают данные пользователя? даже косвенно(например при получении subject) нужно возвращать dto без пароля как сейчас
    @Operation(summary = "Получить данные текущего пользователя")
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(currentUser);
    }

    @Operation(summary = "Обновить имя и фамилию текущего пользователя")
    @PutMapping("/me/update-profile")
    public ResponseEntity<User> updateProfile(@AuthenticationPrincipal User currentUser,
                                              @RequestParam String firstName,
                                              @RequestParam String lastName) {
        User updated = userService.updateProfile(currentUser.getId(), firstName, lastName);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Изменить пароль текущего пользователя")
    @PutMapping("/me/change-password")
    public ResponseEntity<String> changePassword(@AuthenticationPrincipal User currentUser,
                                                 @RequestParam String oldPassword,
                                                 @RequestParam String newPassword) {
        userService.changePassword(currentUser.getId(), oldPassword, newPassword);
        return ResponseEntity.ok("Пароль успешно изменён");
    }


}
