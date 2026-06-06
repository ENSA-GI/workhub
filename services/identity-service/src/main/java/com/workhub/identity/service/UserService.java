package com.workhub.identity.service;

import com.workhub.identity.domain.Role;
import com.workhub.identity.domain.User;
import com.workhub.identity.kafka.UserEventsPublisher;
import com.workhub.identity.kafka.event.UserCreatedEvent;
import com.workhub.identity.kafka.event.UserDeactivatedEvent;
import com.workhub.identity.kafka.event.UserReactivatedEvent;
import com.workhub.identity.kafka.event.UserUpdatedEvent;
import com.workhub.identity.repo.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository repo;
    private final UserEventsPublisher publisher;
    private final AuthService authService;
    private final AuditService auditService;

    public UserService(UserRepository repo,
                       UserEventsPublisher publisher,
                       @Lazy AuthService authService,
                       AuditService auditService) {
        this.repo = repo;
        this.publisher = publisher;
        this.authService = authService;
        this.auditService = auditService;
    }

    @Transactional
    public User createUser(UUID organizationId, String email, String password,
                           String firstName, String lastName, String phone,
                           String avatarUrl, Role role, boolean sendActivation) {
        User u = User.builder()
                .id(UUID.randomUUID())
                .password(password)
                .organizationId(organizationId)
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .phone(phone)
                .avatarUrl(avatarUrl)
                .role(role)
                .active(true)
                .emailVerified(!sendActivation)
                .failedAttempts(0)
                .mfaEnabled(false)
                .build();

        User saved = repo.save(u);

        if (sendActivation) {
            authService.createActivationToken(saved);
        }

        publisher.userCreated(new UserCreatedEvent(
                saved.getId(),
                saved.getOrganizationId(),
                saved.getEmail(),
                saved.getRole().name()
        ));

        return saved;
    }

    @Transactional
    public User createUser(UUID organizationId, String email, String password,
                           String firstName, String lastName, String phone,
                           String avatarUrl, Role role) {
        return createUser(organizationId, email, password, firstName, lastName, phone, avatarUrl, role, false);
    }

    @Transactional
    public User provision(UUID organizationId, String email, String password,
                          String firstName, String lastName, String phone,
                          String avatarUrl, Role role) {
        return repo.findByEmail(email)
                .map(existing -> {
                    existing.setFirstName(firstName);
                    existing.setLastName(lastName);
                    existing.setPhone(phone);
                    existing.setAvatarUrl(avatarUrl);
                    existing.setRole(role);
                    User updated = repo.save(existing);
                    publisher.userUpdated(new UserUpdatedEvent(
                            updated.getId(),
                            updated.getEmail(),
                            updated.getRole().name()
                    ));
                    return updated;
                })
                .orElseGet(() -> createUser(organizationId, email, password,
                        firstName, lastName, phone, avatarUrl, role, true));
    }

    @Transactional
    public User updateProfile(UUID userId, String firstName, String lastName, String phone, String avatarUrl) {
        User user = repo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (firstName != null) user.setFirstName(firstName);
        if (lastName != null) user.setLastName(lastName);
        if (phone != null) user.setPhone(phone);
        if (avatarUrl != null) user.setAvatarUrl(avatarUrl);

        User saved = repo.save(user);
        auditService.log(userId, "PROFILE_UPDATED", null, null);
        publisher.userUpdated(new UserUpdatedEvent(saved.getId(), saved.getEmail(), saved.getRole().name()));
        return saved;
    }

    @Transactional
    public void updateLastLogin(String email) {
        repo.findByEmail(email).ifPresent(u -> {
            u.setLastLogin(Instant.now());
            repo.save(u);
        });
    }

    @Transactional
    public User deactivate(UUID userId) {
        User user = repo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        User saved = repo.save(user);
        auditService.log(userId, "USER_DEACTIVATED", null, null);
        publisher.userDeactivated(new UserDeactivatedEvent(saved.getId()));
        return saved;
    }

    @Transactional
    public User reactivate(UUID userId, String encodedTemporaryPassword, String temporaryPassword) {
        User user = repo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(true);
        user.setEmailVerified(true);
        user.setPassword(encodedTemporaryPassword);
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        user.setResetToken(null);
        user.setResetTokenExpiresAt(null);
        user.setActivationToken(null);
        user.setActivationTokenExpiresAt(null);

        User saved = repo.save(user);
        auditService.log(userId, "USER_REACTIVATED", null, null);
        publisher.userReactivated(new UserReactivatedEvent(
                saved.getId(),
                saved.getOrganizationId(),
                saved.getEmail(),
                saved.getFirstName(),
                saved.getLastName(),
                saved.getRole().name(),
                temporaryPassword
        ));
        return saved;
    }
}
