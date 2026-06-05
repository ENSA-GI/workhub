package com.workhub.identity.api;

import com.workhub.identity.api.dto.UserDto;
import com.workhub.identity.domain.Role;
import com.workhub.identity.domain.User;
import com.workhub.identity.repo.UserRepository;
import com.workhub.identity.service.UserService;
import com.workhub.identity.validation.PasswordValidator;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Contrôleur réservé aux appels inter-microservices.
 * Ces routes commencent par /internal/** et ne sont PAS exposées
 * via la Gateway publique (qui ajoute le préfixe /api/).
 */
@RestController
@RequestMapping("/internal")
public class InternalUserController {

    private final UserRepository repo;
    private final UserService service;
    private final PasswordEncoder passwordEncoder;

    public InternalUserController(UserRepository repo,
            UserService service,
            PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.service = service;
        this.passwordEncoder = passwordEncoder;
    }

    public record RegisterUserRequest(
            @NotNull UUID organizationId,
            @NotBlank @Email String email,
            @NotBlank String password,
            String firstName,
            String lastName,
            String phone,
            @NotBlank String role) {
    }

    @PostMapping("/users/register")
    public Map<String, Object> registerUser(@RequestBody @Valid RegisterUserRequest req) {
        PasswordValidator.validate(req.password());

        Role role;
        try {
            role = Role.valueOf(req.role());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + req.role());
        }

        User user = service.createUser(
                req.organizationId(),
                req.email(),
                passwordEncoder.encode(req.password()),
                req.firstName(),
                req.lastName(),
                req.phone(),
                null,
                role,
                false);

        return Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole().name());
    }
}
