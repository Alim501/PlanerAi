package projects.java.taskapi.configs;


import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import projects.java.taskapi.models.User;
import projects.java.taskapi.repositories.UserRepository;
import projects.java.taskapi.services.CustomUserDetailsService;
import projects.java.taskapi.services.JwtService;

import java.io.IOException;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class JwtTokenFilter extends OncePerRequestFilter {

    private final String TOKEN_START = "Bearer ";
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String token = null;

        // check if token is in headers (we don't use it)
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith(TOKEN_START)) {
            token = header.substring(TOKEN_START.length());
        }

        // if token is not in headers check in cookies
        if (token == null && request.getCookies() != null) {
            token = Arrays.stream(request.getCookies())
                    .filter(cookie -> "accessToken".equals(cookie.getName()))
                    .findFirst()
                    .map(Cookie::getValue)
                    .orElse(null);
        }

        // if token not exists then continue security chain
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // extract email from token
        final String email = jwtService.extractUserEmail(token);

        // check context for authentication existing
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            // validate token
            if (jwtService.isTokenValid(token, userDetails)) {

                // Add debug logging
                System.out.println("=== JWT FILTER DEBUG ===");
                System.out.println("User: " + email);
                System.out.println("UserDetails class: " + userDetails.getClass().getName());
                System.out.println("Authorities: " + userDetails.getAuthorities());
                if (userDetails instanceof User) {
                    User user = (User) userDetails;
                    System.out.println("Roles from entity: " + user.getRoles());
                }
                System.out.println("=======================");

                // Set user identity on the spring security context
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println("Authorities: " + userDetails.getAuthorities());
            }
        }

        filterChain.doFilter(request, response);
    }
}
