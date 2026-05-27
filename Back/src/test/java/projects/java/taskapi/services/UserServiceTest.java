package projects.java.taskapi.services;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import projects.java.taskapi.models.User;
import projects.java.taskapi.repositories.RoleRepository;
import projects.java.taskapi.repositories.UserRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private RoleRepository roleRepository;

    @InjectMocks private UserService userService;

    // ── getUserByEmail: found ────────────────────────────────────────────────

    @Test
    void getUserByEmail_withExistingEmail_returnsUser() {
        // Arrange
        String email = "alice@example.com";
        User expected = User.builder().id(1L).email(email).firstName("Alice").build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(expected));

        // Act
        User result = userService.getUserByEmail(email);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo(email);
        assertThat(result.getFirstName()).isEqualTo("Alice");
        verify(userRepository).findByEmail(email);
    }

    // ── getUserByEmail: not found ────────────────────────────────────────────

    @Test
    void getUserByEmail_withNonExistingEmail_throwsEntityNotFoundException() {
        // Arrange
        String email = "ghost@nowhere.com";

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(EntityNotFoundException.class,
                () -> userService.getUserByEmail(email));
        verify(userRepository).findByEmail(email);
    }
}
