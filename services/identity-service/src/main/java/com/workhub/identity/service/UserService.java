package com.workhub.identity.service;

import com.workhub.identity.domain.Role;
import com.workhub.identity.domain.User;
import com.workhub.identity.kafka.UserEventsPublisher;
import com.workhub.identity.kafka.event.EmailVerificationEvent;
import com.workhub.identity.kafka.event.UserCreatedEvent;
import com.workhub.identity.kafka.event.UserDeactivatedEvent;
import com.workhub.identity.kafka.event.UserInvitationEvent;
import com.workhub.identity.kafka.event.UserUpdatedEvent;
import com.workhub.identity.repo.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository repo;
    private final UserEventsPublisher publisher;
    private final MfaService mfaService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${workhub.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public UserService(UserRepository repo, UserEventsPublisher publisher, MfaService mfaService) {
        this.repo = repo;
        this.publisher = publisher;
        this.mfaService = mfaService;
    }

    @Transactional
    public User registerPendingOwner(String email, String encodedPassword,
                                     String firstName, String lastName, String phone,
                                     boolean termsAccepted) {
        if (!termsAccepted) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Acceptation des CGU et RGPD obligatoire");
        }
        if (repo.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un compte existe déjà avec cet email");
        }

        String token = generateToken();
        User u = User.builder()
                .id(UUID.randomUUID())
                .password(encodedPassword)
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .phone(phone)
                .role(Role.PENDING_OWNER)
                .active(true)
                .emailVerified(false)
                .mfaEnabled(false)
                .termsAcceptedAt(Instant.now())
                .emailVerificationToken(token)
                .emailVerificationTokenExpiresAt(Instant.now().plus(48, ChronoUnit.HOURS))
                .build();

        User saved = repo.save(u);
        publisher.userCreated(new UserCreatedEvent(
                saved.getId(), saved.getOrganizationId(), saved.getEmail(), saved.getRole().name()));
        publisher.emailVerification(new EmailVerificationEvent(
                saved.getId(),
                saved.getEmail(),
                saved.getFirstName(),
                token,
                frontendBaseUrl + "/verify-email?token=" + token
        ));
        return saved;
    }

    @Transactional
    public User verifyEmail(String token) {
        User user = repo.findByEmailVerificationToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token invalide"));
        if (user.getEmailVerificationTokenExpiresAt() != null
                && user.getEmailVerificationTokenExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token expiré");
        }
        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiresAt(null);
        return repo.save(user);
    }

    public record MfaSetupResponse(String secret, String qrCodeDataUri) {}

    @Transactional
    public MfaSetupResponse initiateMfaSetup(UUID userId) {
        User user = getUser(userId);
        String secret = mfaService.generateSecret();
        user.setMfaSecret(secret);
        user.setMfaEnabled(false);
        repo.save(user);
        return new MfaSetupResponse(secret, mfaService.buildQrDataUri(secret, user.getEmail()));
    }

    @Transactional
    public User confirmMfaSetup(UUID userId, String code) {
        User user = getUser(userId);
        if (user.getMfaSecret() == null || !mfaService.verifyCode(user.getMfaSecret(), code)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code MFA invalide");
        }
        user.setMfaEnabled(true);
        return repo.save(user);
    }

    @Transactional
    public User completeMfaLogin(UUID userId, String code) {
        User user = getUser(userId);
        if (!mfaService.verifyCode(user.getMfaSecret(), code)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Code MFA invalide");
        }
        user.setLastLogin(Instant.now());
        return repo.save(user);
    }

    @Transactional
    public User linkOrganizationAndPromote(UUID userId, UUID organizationId) {
        User user = getUser(userId);
        if (user.getRole() != Role.PENDING_OWNER && user.getRole() != Role.ORG_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Rôle non autorisé pour cette opération");
        }
        user.setOrganizationId(organizationId);
        user.setRole(Role.ORG_ADMIN);
        User saved = repo.save(user);
        publisher.userUpdated(new UserUpdatedEvent(saved.getId(), saved.getEmail(), saved.getRole().name()));
        publisher.userCreated(new UserCreatedEvent(
                saved.getId(), saved.getOrganizationId(), saved.getEmail(), saved.getRole().name()));
        return saved;
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
                .mfaEnabled(false)
                .build();

        User saved = repo.save(u);
        publisher.userCreated(new UserCreatedEvent(
                saved.getId(), saved.getOrganizationId(), saved.getEmail(), saved.getRole().name()));
        return saved;
    }

    @Transactional
    public User inviteRhManager(UUID organizationId, String email, String firstName,
                                String lastName, String phone, String encodedTempPassword) {
        if (repo.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email déjà utilisé");
        }
        String inviteToken = generateToken();
        User u = User.builder()
                .id(UUID.randomUUID())
                .password(encodedTempPassword)
                .organizationId(organizationId)
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .phone(phone)
                .role(Role.RH_MANAGER)
                .active(true)
                .emailVerified(false)
                .mfaEnabled(false)
                .invitationToken(inviteToken)
                .invitationTokenExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
                .build();
        User saved = repo.save(u);
        publisher.userCreated(new UserCreatedEvent(
                saved.getId(), saved.getOrganizationId(), saved.getEmail(), saved.getRole().name()));
        publisher.userInvitation(new UserInvitationEvent(
                saved.getId(),
                organizationId,
                email,
                firstName,
                Role.RH_MANAGER.name(),
                inviteToken,
                frontendBaseUrl + "/accept-invite?token=" + inviteToken
        ));
        return saved;
    }

    @Transactional
    public User acceptInvitation(String token, String newEncodedPassword) {
        User user = repo.findByInvitationToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invitation invalide"));
        if (user.getInvitationTokenExpiresAt() != null
                && user.getInvitationTokenExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invitation expirée");
        }
        user.setPassword(newEncodedPassword);
        user.setInvitationToken(null);
        user.setInvitationTokenExpiresAt(null);
        user.setEmailVerified(true);
        return repo.save(user);
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
                            updated.getId(), updated.getEmail(), updated.getRole().name()));
                    return updated;
                })
                .orElseGet(() -> createUser(organizationId, email, password,
                        firstName, lastName, phone, avatarUrl, role));
    }

    @Transactional
    public void deactivate(UUID userId) {
        repo.findById(userId).ifPresent(u -> {
            u.setActive(false);
            repo.save(u);
            publisher.userDeactivated(new UserDeactivatedEvent(u.getId()));
        });
    }

    public User getUser(UUID id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
