package projects.java.taskapi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import projects.java.taskapi.models.User;
import projects.java.taskapi.repositories.UserRepository;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {

    private final UserRepository userRepository;

    @GetMapping("/my-roles")
    public ResponseEntity<?> checkMyRoles(@AuthenticationPrincipal User currentUser) {
        // What Spring Security sees
        Map<String, Object> debug = new HashMap<>();
        debug.put("email", currentUser.getEmail());
        debug.put("authorities_from_security", currentUser.getAuthorities());
        debug.put("roles_from_entity", currentUser.getRoles());

        // What's actually in database
        User freshUser = userRepository.findByEmail(currentUser.getEmail()).orElse(null);
        if (freshUser != null) {
            debug.put("roles_from_db", freshUser.getRoles());
            debug.put("authorities_from_db", freshUser.getAuthorities());
        }

        return ResponseEntity.ok(debug);
    }
}
