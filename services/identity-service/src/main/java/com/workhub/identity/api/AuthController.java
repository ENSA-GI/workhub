package com.workhub.identity.api;

import com.workhub.identity.domain.Role;
import com.workhub.identity.domain.User;
import com.workhub.identity.service.AuthService;
import com.workhub.identity.service.AuthService.LoginResult;
import com.workhub.identity.service.AuthService.LoginStatus;
import com.workhub.identity.service.UserService;
import com.workhub.identity.util.SecurityUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

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
            @NotBlank String password,
            String mfaCode
    ) {}

    public record RegisterOwnerRequest(
            @NotBlank @Email String email,
            @NotBlank String password,
            @NotBlank String firstName,
            @NotBlank String lastName,
            String phone,
            @AssertTrue(message = "Acceptation des CGU et RGPD obligatoire") boolean termsAccepted,
            @AssertTrue(message = "Acceptation de la politique RGPD obligatoire") boolean gdprAccepted
    ) {}

    public record AuthResponse(String status, String token, User user, String message) {}

    public record MfaConfirmRequest(@NotBlank String code) {}

    @PostMapping("/register-owner")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> registerOwner(@RequestBody @Valid RegisterOwnerRequest req) {
        if (!req.termsAccepted() || !req.gdprAccepted()) {
            throw new IllegalArgumentException("CGU et RGPD doivent être acceptés");
        }
        User user = userService.registerPendingOwner(
                req.email(),
                passwordEncoder.encode(req.password()),
                req.firstName(),
                req.lastName(),
                req.phone(),
                true
        );
        return Map.of(
                "message", "Compte créé. Un email de confirmation a été envoyé.",
                "userId", user.getId(),
                "email", user.getEmail()
        );
    }

    @GetMapping("/verify-email")
    public Map<String, String> verifyEmail(@RequestParam String token) {
        userService.verifyEmail(token);
        return Map.of("message", "Email vérifié avec succès. Vous pouvez vous connecter.");
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody @Valid LoginRequest req) {
        LoginResult result = authService.authenticate(req.email(), req.password(), req.mfaCode());
        return new AuthResponse(result.status().name(), result.token(), result.user(), result.message());
    }

    @PostMapping("/mfa/setup")
    public UserService.MfaSetupResponse mfaSetup(@AuthenticationPrincipal Jwt jwt) {
        SecurityUtils.requirePurpose("mfa_setup");
        UUID userId = UUID.fromString(jwt.getSubject());
        return userService.initiateMfaSetup(userId);
    }

    @PostMapping("/mfa/confirm")
    public AuthResponse mfaConfirm(@AuthenticationPrincipal Jwt jwt,
                                   @RequestBody @Valid MfaConfirmRequest req) {
        SecurityUtils.requirePurpose("mfa_setup");
        UUID userId = UUID.fromString(jwt.getSubject());
        User user = userService.confirmMfaSetup(userId, req.code());
        String token = authService.generateToken(user);
        String status = user.getOrganizationId() == null && user.getRole() == Role.PENDING_OWNER
                ? LoginStatus.ORG_SETUP_REQUIRED.name()
                : LoginStatus.SUCCESS.name();
        return new AuthResponse(status, token, user, "MFA activé");
    }

    @PostMapping("/mfa/verify")
    public AuthResponse mfaVerify(@AuthenticationPrincipal Jwt jwt,
                                  @RequestBody @Valid MfaConfirmRequest req) {
        SecurityUtils.requirePurpose("mfa_verify");
        UUID userId = UUID.fromString(jwt.getSubject());
        User user = userService.completeMfaLogin(userId, req.code());
        String fullToken = authService.generateToken(user);
        String status = user.getOrganizationId() == null && user.getRole() == Role.PENDING_OWNER
                ? LoginStatus.ORG_SETUP_REQUIRED.name()
                : LoginStatus.SUCCESS.name();
        return new AuthResponse(status, fullToken, user, "Connexion réussie");
    }

    @PostMapping("/accept-invite")
    public Map<String, String> acceptInvite(@RequestParam String token,
                                            @RequestBody Map<String, String> body) {
        String password = body.get("password");
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Mot de passe requis");
        }
        userService.acceptInvitation(token, passwordEncoder.encode(password));
        return Map.of("message", "Invitation acceptée. Connectez-vous et configurez le MFA.");
    }

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

    @PostMapping("/register")
    public AuthResponse register(@RequestBody @Valid RegisterRequest req) {
        User user = userService.createUser(
                req.organizationId(),
                req.email(),
                passwordEncoder.encode(req.password()),
                req.firstName(),
                req.lastName(),
                req.phone(),
                req.avatarUrl(),
                req.role()
        );
        return new AuthResponse(LoginStatus.EMAIL_NOT_VERIFIED.name(), null, user,
                "Vérifiez votre email");
    }
}
