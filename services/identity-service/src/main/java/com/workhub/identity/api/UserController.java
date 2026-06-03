package com.workhub.identity.api;

import com.workhub.identity.domain.Role;
import com.workhub.identity.domain.User;
import com.workhub.identity.repo.UserRepository;
import com.workhub.identity.service.UserService;
import com.workhub.identity.util.SecurityUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository repo;
    private final UserService service;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository repo, UserService service, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.service = service;
        this.passwordEncoder = passwordEncoder;
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

    public record InviteRhManagerRequest(
            @NotBlank @Email String email,
            @NotBlank String firstName,
            @NotBlank String lastName,
            String phone
    ) {}

    @GetMapping
    public List<User> list(@RequestParam(required = false) UUID organizationId) {
        if (organizationId != null) {
            SecurityUtils.validateOrganizationAccess(organizationId);
            return repo.findByOrganizationId(organizationId);
        }
        if ("SUPER_ADMIN".equals(SecurityUtils.currentRole())) {
            return repo.findAll();
        }
        UUID orgId = SecurityUtils.currentOrganizationId();
        if (orgId != null) {
            return repo.findByOrganizationId(orgId);
        }
        throw new org.springframework.security.access.AccessDeniedException("Contexte organisation requis");
    }

    @PostMapping("/invite-rh-manager")
    @ResponseStatus(HttpStatus.CREATED)
    public User inviteRhManager(@RequestParam UUID organizationId,
                                @RequestBody @Valid InviteRhManagerRequest req) {
        SecurityUtils.validateOrganizationAccess(organizationId);
        String tempPassword = java.util.UUID.randomUUID().toString();
        return service.inviteRhManager(
                organizationId,
                req.email(),
                req.firstName(),
                req.lastName(),
                req.phone(),
                passwordEncoder.encode(tempPassword)
        );
    }

    @GetMapping("/{id}")
    public User getById(@PathVariable UUID id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @GetMapping("/by-email/{email}")
    public User byEmail(@PathVariable String email) {
        return repo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @PostMapping
    public User create(@RequestBody @Valid CreateUserRequest req) {
        return service.createUser(
                req.organizationId(),
                req.email(),
                passwordEncoder.encode(req.password()),
                req.firstName(),
                req.lastName(),
                req.phone(),
                req.avatarUrl(),
                req.role()
        );
    }

    @PostMapping("/provision")
    public User provision(@RequestBody @Valid CreateUserRequest req) {
        return service.provision(
                req.organizationId(),
                req.email(),
                passwordEncoder.encode(req.password()),
                req.firstName(),
                req.lastName(),
                req.phone(),
                req.avatarUrl(),
                req.role()
        );
    }

    @PatchMapping("/{id}/deactivate")
    public void deactivate(@PathVariable UUID id) {
        service.deactivate(id);
    }
}