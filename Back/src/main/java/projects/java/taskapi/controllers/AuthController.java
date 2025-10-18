package projects.java.taskapi.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import projects.java.taskapi.models.dto.AuthRequest;
import projects.java.taskapi.models.dto.AuthResponse;
import projects.java.taskapi.models.dto.RefreshTokenRequest;
import projects.java.taskapi.services.AuthService;

import java.util.Arrays;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "авторизация пользователя")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest, HttpServletResponse response){

        AuthResponse authResponse = authService.loginUser(authRequest);

        composeCookie(response, authResponse);

        return ResponseEntity.ok("Login successful!");
    }

    @Operation(summary = "регистрация пользователя")
    @PostMapping("/reg")
    public ResponseEntity<?> register(@RequestBody AuthRequest authRequest, HttpServletResponse response){

        AuthResponse authResponse = authService.registerUser(authRequest);

        composeCookie(response, authResponse);

        return ResponseEntity.status(HttpStatus.CREATED).body("Registration successful!");
    }

    @Operation(summary = "обновление access токена с помощью refresh токена")
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response){

        String refreshToken = extractCookie(request, "refreshToken");

        System.out.println("refreshToken: "+refreshToken);

        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token not found");
        }

        AuthResponse authResponse = authService.refreshToken(refreshToken);

        composeCookie(response, authResponse);

        return ResponseEntity.status(HttpStatus.OK).body("Refresh successful!");
    }

    @Operation(summary = "выход из аккаунта")
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@AuthenticationPrincipal UserDetails userDetails, HttpServletResponse response) {
        if (userDetails != null) {
            authService.logoutUser(userDetails.getUsername());
        }

        clearCookie(response, "accessToken");
        clearCookie(response, "refreshToken");

        return ResponseEntity.ok("Logout successful");
    }


    // method for adding tokens to the cookie
    private void composeCookie(HttpServletResponse response, AuthResponse authResponse) {
        // Access Token Cookie
        Cookie accessCookie = new Cookie("accessToken", authResponse.getAccessToken());
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(15 * 60); // 15 minutes

        // Refresh Token Cookie
        Cookie refreshCookie = new Cookie("refreshToken", authResponse.getRefreshToken());
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);
    }

    // Utility method to get a cookie value
    private String extractCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> c.getName().equals(name))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    // method for removing tokens in cookies
    private void clearCookie(HttpServletResponse response, String name){
        Cookie cookie = new Cookie(name, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
