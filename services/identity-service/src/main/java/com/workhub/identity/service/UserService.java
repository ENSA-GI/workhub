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
    public User createUser(String clerkId, UUID organizationId, String email,
                           String firstName, String lastName, String phone,
                           String avatarUrl, Role role) {
        User u = User.builder()
                .id(UUID.randomUUID())
                .clerkId(clerkId)
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
                saved.getClerkId(),
                saved.getOrganizationId(),
                saved.getEmail(),
                saved.getRole().name()
        ));

        return saved;
    }

    @Transactional
    public User provision(String clerkId, UUID organizationId, String email,
                          String firstName, String lastName, String phone,
                          String avatarUrl, Role role) {
        return repo.findByClerkId(clerkId)
                .map(existing -> {
                    existing.setEmail(email);
                    existing.setFirstName(firstName);
                    existing.setLastName(lastName);
                    existing.setPhone(phone);
                    existing.setAvatarUrl(avatarUrl);
                    existing.setRole(role);
                    User updated = repo.save(existing);
                    publisher.userUpdated(new UserUpdatedEvent(
                            updated.getId(),
                            updated.getClerkId(),
                            updated.getEmail(),
                            updated.getRole().name()
                    ));
                    return updated;
                })
                .orElseGet(() -> createUser(clerkId, organizationId, email,
                        firstName, lastName, phone, avatarUrl, role));
    }

    @Transactional
    public void updateLastLogin(String clerkId) {
        repo.findByClerkId(clerkId).ifPresent(u -> {
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
                    u.getId(),
                    u.getClerkId()
            ));
        });
    }
}