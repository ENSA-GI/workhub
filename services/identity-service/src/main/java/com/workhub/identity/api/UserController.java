package com.workhub.identity.api;

import com.workhub.identity.api.dto.UserDto;
import com.workhub.identity.domain.AuditLog;
import com.workhub.identity.domain.Role;
import com.workhub.identity.domain.User;
import com.workhub.identity.repo.AuditLogRepository;
import com.workhub.identity.repo.UserRepository;
import com.workhub.identity.service.AuthService;
import com.workhub.identity.service.UserService;
import com.workhub.identity.validation.PasswordValidator;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final String TEMP_PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository repo;
    private final UserService service;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogRepository auditLogRepository;

    public UserController(UserRepository repo,
                          UserService service,
                          AuthService authService,
                          PasswordEncoder passwordEncoder,
                          AuditLogRepository auditLogRepository) {
        this.repo = repo;
        this.service = service;
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
        this.auditLogRepository = auditLogRepository;
    }

    public record CreateUserRequest(
            UUID organizationId,
            @NotBlank @Email String email,
            @NotBlank String password,
            String firstName,
            String lastName,
            String phone,
            String avatarUrl,
            @NotNull Role role
    ) {}

    public record UpdateProfileRequest(
            String firstName,
            String lastName,
            String phone,
            String avatarUrl
    ) {}

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank String newPassword
    ) {}

    @GetMapping("/me")
    public UserDto me(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return repo.findById(userId)
                .map(UserDto::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @PutMapping("/me")
    public UserDto updateMe(@AuthenticationPrincipal Jwt jwt,
                            @RequestBody UpdateProfileRequest req) {
        UUID userId = UUID.fromString(jwt.getSubject());
        User updated = service.updateProfile(userId, req.firstName(), req.lastName(), req.phone(), req.avatarUrl());
        return UserDto.from(updated);
    }

    @PostMapping("/me/change-password")
    public void changePassword(@AuthenticationPrincipal Jwt jwt,
                               @RequestBody @Valid ChangePasswordRequest req) {
        PasswordValidator.validate(req.newPassword());
        UUID userId = UUID.fromString(jwt.getSubject());
        authService.changePassword(userId, req.currentPassword(), req.newPassword());
    }

    @GetMapping("/me/audit")
    public List<AuditLog> myAuditLogs(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @GetMapping("/me/sessions")
    public List<SessionInfo> mySessions(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return List.of(new SessionInfo(userId, "current", true));
    }

    public record SessionInfo(UUID userId, String label, boolean current) {}

    @GetMapping
    public List<UserDto> list(@AuthenticationPrincipal Jwt jwt,
                              @RequestParam(required = false) UUID organizationId) {
        String role = jwt.getClaimAsString("role");
        UUID orgId = parseOrgId(jwt);

        if ("SUPER_ADMIN".equals(role)) {
            List<User> users = organizationId != null
                    ? repo.findByOrganizationId(organizationId)
                    : repo.findAll();
            return users.stream().map(UserDto::from).toList();
        }

        if (organizationId != null && !organizationId.equals(orgId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        return repo.findByOrganizationId(orgId).stream().map(UserDto::from).toList();
    }

    @GetMapping("/{id}")
    public UserDto getById(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        User user = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        assertAccess(jwt, user);
        return UserDto.from(user);
    }

    @GetMapping("/by-email/{email}")
    public UserDto byEmail(@AuthenticationPrincipal Jwt jwt, @PathVariable String email) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        assertAccess(jwt, user);
        return UserDto.from(user);
    }

    @PostMapping
    public UserDto create(@AuthenticationPrincipal Jwt jwt,
                          @RequestBody @Valid CreateUserRequest req) {
        assertCanManageUsers(jwt, req.organizationId());
        PasswordValidator.validate(req.password());
        User user = service.createUser(
                req.organizationId(),
                req.email(),
                passwordEncoder.encode(req.password()),
                req.firstName(),
                req.lastName(),
                req.phone(),
                req.avatarUrl(),
                req.role(),
                req.role() == Role.EMPLOYEE
        );
        return UserDto.from(user);
    }

    @PostMapping("/provision")
    public UserDto provision(@AuthenticationPrincipal Jwt jwt,
                             @RequestBody @Valid CreateUserRequest req) {
        String role = jwt.getClaimAsString("role");
        if (!"SUPER_ADMIN".equals(role) && !"ORG_ADMIN".equals(role) && !"RH_MANAGER".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        PasswordValidator.validate(req.password());
        User user = service.provision(
                req.organizationId(),
                req.email(),
                passwordEncoder.encode(req.password()),
                req.firstName(),
                req.lastName(),
                req.phone(),
                req.avatarUrl(),
                req.role()
        );
        return UserDto.from(user);
    }

    @PatchMapping("/{id}/deactivate")
    public UserDto deactivate(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        User target = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        assertCanManageUsers(jwt, target.getOrganizationId());
        return UserDto.from(service.deactivate(id));
    }

    @PatchMapping("/{id}/reactivate")
    public UserDto reactivate(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        User target = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        assertCanManageUsers(jwt, target.getOrganizationId());
        String temporaryPassword = generateTemporaryPassword();
        return UserDto.from(service.reactivate(id, passwordEncoder.encode(temporaryPassword), temporaryPassword));
    }

    private void assertAccess(Jwt jwt, User user) {
        if (jwt == null) return;
        String role = jwt.getClaimAsString("role");
        if ("SUPER_ADMIN".equals(role)) return;

        UUID orgId = parseOrgId(jwt);
        if (orgId == null || !orgId.equals(user.getOrganizationId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        if (jwt.getSubject().equals(user.getId().toString())) return;

        if (!"ORG_ADMIN".equals(role) && !"RH_MANAGER".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    private void assertCanManageUsers(Jwt jwt, UUID targetOrgId) {
        String role = jwt.getClaimAsString("role");
        if ("SUPER_ADMIN".equals(role)) return;

        if (!"ORG_ADMIN".equals(role) && !"RH_MANAGER".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        UUID orgId = parseOrgId(jwt);
        if (targetOrgId != null && !targetOrgId.equals(orgId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    private UUID parseOrgId(Jwt jwt) {
        String orgId = jwt.getClaimAsString("org_id");
        if (orgId == null || orgId.isBlank()) return null;
        return UUID.fromString(orgId);
    }

    private String generateTemporaryPassword() {
        StringBuilder password = new StringBuilder();
        password.append(randomFrom("ABCDEFGHJKLMNPQRSTUVWXYZ"));
        password.append(randomFrom("abcdefghijkmnopqrstuvwxyz"));
        password.append(randomFrom("23456789"));
        password.append(randomFrom("!@#$%"));
        while (password.length() < 14) {
            password.append(randomFrom(TEMP_PASSWORD_CHARS));
        }
        return password.toString();
    }

    private char randomFrom(String source) {
        return source.charAt(SECURE_RANDOM.nextInt(source.length()));
    }
}
