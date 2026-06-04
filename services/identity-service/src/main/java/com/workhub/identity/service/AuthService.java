package com.workhub.identity.service;

import com.workhub.identity.domain.User;
import com.workhub.identity.repo.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;

@Service
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCK_MINUTES = 15;
    private static final int ACCESS_TOKEN_HOURS = 1;
    private static final int MFA_SESSION_MINUTES = 5;
    private static final int ACTIVATION_HOURS = 48;
    private static final int RESET_HOURS = 1;

    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final RefreshTokenService refreshTokenService;
    private final MfaService mfaService;
    private final AuditService auditService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository repo,
                       PasswordEncoder passwordEncoder,
                       JwtEncoder jwtEncoder,
                       RefreshTokenService refreshTokenService,
                       MfaService mfaService,
                       AuditService auditService) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.refreshTokenService = refreshTokenService;
        this.mfaService = mfaService;
        this.auditService = auditService;
    }

    public record AuthResult(String accessToken, String refreshToken, User user, boolean mfaRequired, String mfaSessionToken) {}

    @Transactional
    public AuthResult authenticate(String email, String password, String ipAddress) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> {
                    auditService.log(null, "LOGIN_FAILED", "Unknown email: " + email, ipAddress);
                    return new RuntimeException("Invalid credentials");
                });

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new RuntimeException("Account deactivated");
        }

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(Instant.now())) {
            throw new RuntimeException("Account locked. Try again later.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            int attempts = (user.getFailedAttempts() != null ? user.getFailedAttempts() : 0) + 1;
            user.setFailedAttempts(attempts);
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setLockedUntil(Instant.now().plus(LOCK_MINUTES, ChronoUnit.MINUTES));
                user.setFailedAttempts(0);
            }
            repo.save(user);
            auditService.log(user.getId(), "LOGIN_FAILED", "Invalid password", ipAddress);
            throw new RuntimeException("Invalid credentials");
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Email not verified. Please activate your account.");
        }

        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        user.setLastLogin(Instant.now());
        repo.save(user);

        if (mfaService.requiresMfaChallenge(user)) {
            String mfaSession = generateMfaSessionToken(user);
            auditService.log(user.getId(), "LOGIN_MFA_REQUIRED", null, ipAddress);
            return new AuthResult(null, null, user, true, mfaSession);
        }

        auditService.log(user.getId(), "LOGIN_SUCCESS", null, ipAddress);
        return completeAuth(user);
    }

    public AuthResult completeMfaLogin(String mfaSessionToken, String code, String ipAddress) {
        UUID userId = parseMfaSessionUserId(mfaSessionToken);
        User user = repo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Invalid MFA session"));

        mfaService.verifyCode(userId, code);
        auditService.log(userId, "MFA_VERIFY_SUCCESS", null, ipAddress);
        return completeAuth(user);
    }

    public AuthResult completeAuth(User user) {
        String accessToken = generateAccessToken(user);
        String refreshToken = refreshTokenService.createRefreshToken(user);
        return new AuthResult(accessToken, refreshToken, user, false, null);
    }

    public AuthResult refresh(String rawRefreshToken) {
        User user = refreshTokenService.validateAndRotate(rawRefreshToken, id ->
                repo.findById(id).orElse(null));
        String accessToken = generateAccessToken(user);
        String newRefresh = refreshTokenService.createRefreshToken(user);
        return new AuthResult(accessToken, newRefresh, user, false, null);
    }

    @Transactional
    public void logout(String rawRefreshToken, UUID userId, String ipAddress) {
        if (rawRefreshToken != null) {
            refreshTokenService.revoke(rawRefreshToken);
        }
        auditService.log(userId, "LOGOUT", null, ipAddress);
    }

    @Transactional
    public String createActivationToken(User user) {
        String token = generateToken();
        user.setActivationToken(token);
        user.setActivationTokenExpiresAt(Instant.now().plus(ACTIVATION_HOURS, ChronoUnit.HOURS));
        repo.save(user);
        return token;
    }

    @Transactional
    public User activateAccount(String token, String newPassword) {
        User user = repo.findByActivationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid activation token"));

        if (user.getActivationTokenExpiresAt() == null
                || user.getActivationTokenExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Activation token expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setEmailVerified(true);
        user.setActivationToken(null);
        user.setActivationTokenExpiresAt(null);
        return repo.save(user);
    }

    @Transactional
    public String requestPasswordReset(String email) {
        return repo.findByEmail(email).map(user -> {
            String token = generateToken();
            user.setResetToken(token);
            user.setResetTokenExpiresAt(Instant.now().plus(RESET_HOURS, ChronoUnit.HOURS));
            repo.save(user);
            auditService.log(user.getId(), "PASSWORD_RESET_REQUESTED", null, null);
            return token;
        }).orElse(null);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = repo.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (user.getResetTokenExpiresAt() == null
                || user.getResetTokenExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Reset token expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiresAt(null);
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        repo.save(user);
        refreshTokenService.revokeAllForUser(user.getId());
        auditService.log(user.getId(), "PASSWORD_RESET", null, null);
    }

    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        User user = repo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        repo.save(user);
        refreshTokenService.revokeAllForUser(userId);
        auditService.log(userId, "PASSWORD_CHANGED", null, null);
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("workhub-identity-service")
                .issuedAt(now)
                .expiresAt(now.plus(ACCESS_TOKEN_HOURS, ChronoUnit.HOURS))
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("org_id", user.getOrganizationId() != null ? user.getOrganizationId().toString() : "")
                .claim("first_name", user.getFirstName() != null ? user.getFirstName() : "")
                .claim("last_name", user.getLastName() != null ? user.getLastName() : "")
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public String generateToken(User user) {
        return generateAccessToken(user);
    }

    private String generateMfaSessionToken(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("workhub-identity-service")
                .issuedAt(now)
                .expiresAt(now.plus(MFA_SESSION_MINUTES, ChronoUnit.MINUTES))
                .subject(user.getId().toString())
                .claim("mfa_pending", true)
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    private UUID parseMfaSessionUserId(String token) {
        try {
            String payload = new String(Base64.getUrlDecoder().decode(token.split("\\.")[1]));
            if (!payload.contains("\"mfa_pending\":true")) {
                throw new RuntimeException("Invalid MFA session");
            }
            String sub = payload.split("\"sub\":\"")[1].split("\"")[0];
            return UUID.fromString(sub);
        } catch (Exception e) {
            throw new RuntimeException("Invalid MFA session");
        }
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
