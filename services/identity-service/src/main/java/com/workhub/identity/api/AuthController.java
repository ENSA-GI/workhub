package com.workhub.identity.api;

import com.workhub.identity.api.dto.UserDto;
import com.workhub.identity.domain.Role;
import com.workhub.identity.domain.User;
import com.workhub.identity.service.AuthService;
import com.workhub.identity.service.UserService;
import com.workhub.identity.validation.PasswordValidator;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
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
            String refreshToken,
            UserDto user,
            boolean mfaRequired,
            String mfaSessionToken
    ) {}

    public record RegisterRequest(
            UUID organizationId,
            @NotBlank @Email String email,
            @NotBlank String password,
            String firstName,
            String lastName,
            String phone,
            String avatarUrl,
            Role role
    ) {}

    public record RefreshRequest(@NotBlank String refreshToken) {}

    public record LogoutRequest(String refreshToken) {}

    public record ActivateRequest(@NotBlank String token, @NotBlank String password) {}

    public record ForgotPasswordRequest(@NotBlank @Email String email) {}

    public record ResetPasswordRequest(@NotBlank String token, @NotBlank String password) {}

    public record MfaVerifyRequest(@NotBlank String mfaSessionToken, @NotBlank String code) {}

    @PostMapping("/login")
    public AuthResponse login(@RequestBody @Valid LoginRequest req, HttpServletRequest httpReq) {
        AuthService.AuthResult result = authService.authenticate(
                req.email(), req.password(), httpReq.getRemoteAddr());
        return toResponse(result);
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody @Valid RegisterRequest req) {
        Role role = req.role() != null ? req.role() : Role.CANDIDATE;
        if (role == Role.SUPER_ADMIN || role == Role.ORG_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Cannot self-register with elevated role");
        }

        PasswordValidator.validate(req.password());
        String encodedPassword = passwordEncoder.encode(req.password());
        User user = userService.createUser(
                req.organizationId(),
                req.email(),
                encodedPassword,
                req.firstName(),
                req.lastName(),
                req.phone(),
                req.avatarUrl(),
                role
        );
        AuthService.AuthResult result = authService.completeAuth(user);
        return toResponse(result);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@RequestBody @Valid RefreshRequest req) {
        return toResponse(authService.refresh(req.refreshToken()));
    }

    @PostMapping("/logout")
    public Map<String, String> logout(@RequestBody(required = false) LogoutRequest req,
                                      HttpServletRequest httpReq,
                                      @RequestHeader(value = "Authorization", required = false) String authHeader) {
        UUID userId = extractUserId(authHeader);
        String refreshToken = req != null ? req.refreshToken() : null;
        authService.logout(refreshToken, userId, httpReq.getRemoteAddr());
        return Map.of("message", "Logged out");
    }

    @PostMapping("/activate")
    public Map<String, String> activate(@RequestBody @Valid ActivateRequest req) {
        PasswordValidator.validate(req.password());
        authService.activateAccount(req.token(), req.password());
        return Map.of("message", "Account activated");
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@RequestBody @Valid ForgotPasswordRequest req) {
        String token = authService.requestPasswordReset(req.email());
        if (token != null) {
            return Map.of("message", "If the email exists, a reset link has been sent", "devToken", token);
        }
        return Map.of("message", "If the email exists, a reset link has been sent");
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@RequestBody @Valid ResetPasswordRequest req) {
        PasswordValidator.validate(req.password());
        authService.resetPassword(req.token(), req.password());
        return Map.of("message", "Password reset successful");
    }

    @PostMapping("/mfa/verify")
    public AuthResponse verifyMfa(@RequestBody @Valid MfaVerifyRequest req, HttpServletRequest httpReq) {
        return toResponse(authService.completeMfaLogin(req.mfaSessionToken(), req.code(), httpReq.getRemoteAddr()));
    }

    private AuthResponse toResponse(AuthService.AuthResult result) {
        UserDto userDto = result.user() != null ? UserDto.from(result.user()) : null;
        return new AuthResponse(
                result.accessToken(),
                result.refreshToken(),
                userDto,
                result.mfaRequired(),
                result.mfaSessionToken()
        );
    }

    private UUID extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        try {
            String payload = new String(java.util.Base64.getUrlDecoder()
                    .decode(authHeader.substring(7).split("\\.")[1]));
            String sub = payload.split("\"sub\":\"")[1].split("\"")[0];
            return UUID.fromString(sub);
        } catch (Exception e) {
            return null;
        }
    }
}
