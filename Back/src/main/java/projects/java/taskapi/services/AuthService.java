package projects.java.taskapi.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import projects.java.taskapi.models.dto.AuthRequest;
import projects.java.taskapi.models.dto.AuthResponse;
import projects.java.taskapi.models.dto.RefreshTokenRequest;
import projects.java.taskapi.exceptions.TokenValidationException;
import projects.java.taskapi.models.enums.Role;
import projects.java.taskapi.models.User;
import projects.java.taskapi.repositories.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse registerUser(AuthRequest authRequest){
        User user = User.builder()
                .email(authRequest.getEmail())
                .password(passwordEncoder.encode(authRequest.getPassword()))
                .role(Role.STUDENT)
                .build();

        String refreshToken = jwtService.generateRefreshToken(user);
        String accessToken = jwtService.generateAccessToken(user);

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return new AuthResponse(accessToken, refreshToken);
    }

    public AuthResponse loginUser(AuthRequest authRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword()));

        User user = userRepository.findByEmail(authRequest.getEmail())
                .orElseThrow(() -> new EntityNotFoundException(String.format("Пользователь с email: %s не найден", authRequest.getEmail())));

        String access = jwtService.generateAccessToken(user);
        String refresh = jwtService.generateRefreshToken(user);
        user.setRefreshToken(refresh);
        userRepository.save(user);

        return new AuthResponse(access, refresh);
    }

    public AuthResponse refreshToken(RefreshTokenRequest refreshRequest) {

        String refreshToken = refreshRequest.getRefreshToken();
        String email = jwtService.extractUserEmail(refreshToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException(String.format("Пользователь с email: %s не найден", email)));

        if(!refreshToken.equals(user.getRefreshToken())){
            throw new TokenValidationException("Рефреш токен не совпадает");
        }

        if (!jwtService.isTokenValid(refreshRequest.getRefreshToken(), user)){
            throw new TokenValidationException("Токен не валидный или вышел срок годности");
        }

        String accessToken = jwtService.generateAccessToken(user);

        return new AuthResponse(accessToken, refreshToken);
    }
}
