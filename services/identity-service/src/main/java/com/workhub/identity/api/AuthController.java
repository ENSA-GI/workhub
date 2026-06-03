package com.workhub.identity.api;

import com.workhub.identity.domain.Role;
import com.workhub.identity.domain.User;
import com.workhub.identity.service.AuthService;
import com.workhub.identity.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthService authService, UserService userService, PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {}

    public record AuthResponse(
            String token,
            User user
    ) {}

    public record RegisterRequest(
            UUID organizationId,
            @NotBlank @Email String email,
            @NotBlank String password,
            String firstName,
            String lastName,
            String phone,
            String avatarUrl,
            @NotNull Role role
    ) {}

    @PostMapping("/login")
    public AuthResponse login(@RequestBody @Valid LoginRequest req) {
        String token = authService.authenticate(req.email(), req.password());
        // Reload user to return it in response if needed (optional)
        return new AuthResponse(token, null);
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody @Valid RegisterRequest req) {
        String encodedPassword = passwordEncoder.encode(req.password());
        User user = userService.createUser(
                req.organizationId(),
                req.email(),
                encodedPassword,
                req.firstName(),
                req.lastName(),
                req.phone(),
                req.avatarUrl(),
                req.role()
        );
        String token = authService.generateToken(user);
        return new AuthResponse(token, user);
    }
}
