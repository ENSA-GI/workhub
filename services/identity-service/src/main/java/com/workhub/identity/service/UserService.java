package com.workhub.identity.service;

import com.workhub.identity.domain.Role;
import com.workhub.identity.domain.User;
import com.workhub.identity.kafka.UserEventsPublisher;
import com.workhub.identity.kafka.event.UserCreatedEvent;
import com.workhub.identity.kafka.event.UserDeactivatedEvent;
import com.workhub.identity.kafka.event.UserUpdatedEvent;
import com.workhub.identity.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository repo;
    private final UserEventsPublisher publisher;

    public UserService(UserRepository repo, UserEventsPublisher publisher) {
        this.repo = repo;
        this.publisher = publisher;
    }

    @Transactional
    public User createUser(UUID organizationId, String email, String password,
                           String firstName, String lastName, String phone,
                           String avatarUrl, Role role) {
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
                .emailVerified(false)
                .build();

        User saved = repo.save(u);

        publisher.userCreated(new UserCreatedEvent(
                saved.getId(),
                saved.getOrganizationId(),
                saved.getEmail(),
                saved.getRole().name()
        ));

        return saved;
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
                        firstName, lastName, phone, avatarUrl, role));
    }

    @Transactional
    public void updateLastLogin(String email) {
        repo.findByEmail(email).ifPresent(u -> {
            u.setLastLogin(Instant.now());
            repo.save(u);
        });
    }

    @Transactional
    public void deactivate(UUID userId) {
        repo.findById(userId).ifPresent(u -> {
            u.setActive(false);
            repo.save(u);
            publisher.userDeactivated(new UserDeactivatedEvent(
                    u.getId()
            ));
        });
    }
}