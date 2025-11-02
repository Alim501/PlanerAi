package projects.java.taskapi.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import projects.java.taskapi.models.Role;
import projects.java.taskapi.models.dto.AuthRequest;
import projects.java.taskapi.models.dto.AuthResponse;
import projects.java.taskapi.exceptions.TokenValidationException;
import projects.java.taskapi.models.enums.RoleName;
import projects.java.taskapi.models.User;
import projects.java.taskapi.repositories.RoleRepository;
import projects.java.taskapi.repositories.UserRepository;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    public AuthResponse registerUser(AuthRequest authRequest){

        Role studentRole = roleRepository.findByName(RoleName.ROLE_STUDENT)
                .orElseThrow(() -> new EntityNotFoundException("Default role not found"));

        User user = User.builder()
                .email(authRequest.getEmail())
                .password(passwordEncoder.encode(authRequest.getPassword()))
                .roles(Set.of(studentRole))
                .build();

        String refreshToken = jwtService.generateRefreshToken(user);
        String accessToken = jwtService.generateAccessToken(user);

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return new AuthResponse(accessToken, refreshToken);
    }

    public AuthResponse loginUser(AuthRequest authRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getEmail(),
                            authRequest.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(authRequest.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        String access = jwtService.generateAccessToken(user);
        String refresh = jwtService.generateRefreshToken(user);
        user.setRefreshToken(refresh);
        userRepository.save(user);

        return new AuthResponse(access, refresh);
    }

    public AuthResponse refreshToken(String refreshToken) {

        String email = jwtService.extractUserEmail(refreshToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if(!refreshToken.equals(user.getRefreshToken())){
            throw new TokenValidationException("Refresh token mismatch");
        }

        if (!jwtService.isTokenValid(refreshToken, user)){
            throw new TokenValidationException("Token is not valid or expired");
        }

        String accessToken = jwtService.generateAccessToken(user);

        return new AuthResponse(accessToken, refreshToken);
    }

    public void logoutUser(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setRefreshToken(null);
            userRepository.save(user);
        });
    }
}
