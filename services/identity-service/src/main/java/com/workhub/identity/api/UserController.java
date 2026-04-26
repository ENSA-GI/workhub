package com.workhub.identity.api;

import com.workhub.identity.domain.Role;
import com.workhub.identity.domain.User;
import com.workhub.identity.repo.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository repo;

    public UserController(UserRepository repo) {
        this.repo = repo;
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

    @PostMapping
    public User create(@RequestBody @Valid CreateUserRequest req) {
        User u = User.builder()
                .id(UUID.randomUUID())
                .clerkId(req.clerkId())
                .organizationId(req.organizationId())
                .email(req.email())
                .firstName(req.firstName())
                .lastName(req.lastName())
                .phone(req.phone())
                .avatarUrl(req.avatarUrl())
                .role(req.role())
                .active(true)
                .emailVerified(false)
                .build();
        return repo.save(u);
    }

    @GetMapping("/by-clerk/{clerkId}")
    public User byClerk(@PathVariable String clerkId) {
        return repo.findByClerkId(clerkId).orElseThrow();
    }

    @PostMapping("/provision")
    public User provision(@RequestBody @Valid CreateUserRequest req) {
        return repo.findByClerkId(req.clerkId())
                .map(existing -> {
                    existing.setEmail(req.email());
                    existing.setFirstName(req.firstName());
                    existing.setLastName(req.lastName());
                    existing.setPhone(req.phone());
                    existing.setAvatarUrl(req.avatarUrl());
                    existing.setRole(req.role());
                    return repo.save(existing);
                })
                .orElseGet(() -> create(req));
    }
}
