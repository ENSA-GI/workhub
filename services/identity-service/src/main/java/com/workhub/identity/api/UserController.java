package com.workhub.identity.api;

import com.workhub.identity.domain.Role;
import com.workhub.identity.domain.User;
import com.workhub.identity.repo.UserRepository;
import com.workhub.identity.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository repo;
    private final UserService service;

    public UserController(UserRepository repo, UserService service) {
        this.repo = repo;
        this.service = service;
    }

    public record CreateUserRequest(
            @NotBlank String clerkId,
            UUID organizationId,
            @NotBlank @Email String email,
            String firstName,
            String lastName,
            String phone,
            String avatarUrl,
            @NotNull Role role
    ) {}

    @GetMapping
    public List<User> list(@RequestParam(required = false) UUID organizationId) {
        if (organizationId == null) return repo.findAll();
        return repo.findByOrganizationId(organizationId);
    }

    @GetMapping("/{id}")
    public User getById(@PathVariable UUID id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @GetMapping("/by-clerk/{clerkId}")
    public User byClerk(@PathVariable String clerkId) {
        return repo.findByClerkId(clerkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @PostMapping
    public User create(@RequestBody @Valid CreateUserRequest req) {
        return service.createUser(
                req.clerkId(),
                req.organizationId(),
                req.email(),
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
                req.clerkId(),
                req.organizationId(),
                req.email(),
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

    @PostMapping("/login")
    public User login(@RequestBody @Valid LoginRequest req) {
        User user = repo.findByClerkId(req.clerkId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        service.updateLastLogin(req.clerkId());
        return user;
    }

    public record LoginRequest(@NotBlank String clerkId) {}
}