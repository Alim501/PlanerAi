package projects.java.taskapi.services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import projects.java.taskapi.exceptions.TokenValidationException;
import projects.java.taskapi.models.Role;
import projects.java.taskapi.models.User;
import projects.java.taskapi.models.dto.AuthRequest;
import projects.java.taskapi.models.dto.AuthResponse;
import projects.java.taskapi.models.enums.RoleName;
import projects.java.taskapi.repositories.RoleRepository;
import projects.java.taskapi.repositories.UserRepository;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private RoleRepository roleRepository;

    @InjectMocks private AuthService authService;

    // ── registerUser (generateToken): valid credentials ──────────────────────

    @Test
    void registerUser_withValidCredentials_returnsAuthResponseWithBothTokens() {
        // Arrange
        Role studentRole = Role.builder().id(1L).name(RoleName.ROLE_STUDENT).build();
        AuthRequest request = new AuthRequest();
        request.setEmail("new@example.com");
        request.setPassword("secret123");

        when(roleRepository.findByName(RoleName.ROLE_STUDENT)).thenReturn(Optional.of(studentRole));
        when(passwordEncoder.encode("secret123")).thenReturn("$2a$encoded");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh-token-value");
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("access-token-value");

        // Act
        AuthResponse response = authService.registerUser(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access-token-value");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token-value");
        verify(jwtService).generateAccessToken(any(User.class));
        verify(jwtService).generateRefreshToken(any(User.class));
        verify(userRepository).save(any(User.class));
    }

    // ── refreshToken (validateToken): expired / invalid token ───────────────

    @Test
    void refreshToken_withExpiredToken_throwsTokenValidationException() {
        // Arrange
        String expiredToken = "expired.refresh.token";
        String email = "user@example.com";
        User user = User.builder()
                .id(1L).email(email)
                .refreshToken(expiredToken)   // stored token matches the presented one
                .roles(Set.of())
                .build();

        when(jwtService.extractUserEmail(expiredToken)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        // isTokenValid returns false — simulates expiration
        when(jwtService.isTokenValid(expiredToken, user)).thenReturn(false);

        // Act + Assert
        assertThrows(TokenValidationException.class,
                () -> authService.refreshToken(expiredToken));
        verify(jwtService).isTokenValid(expiredToken, user);
    }
}
