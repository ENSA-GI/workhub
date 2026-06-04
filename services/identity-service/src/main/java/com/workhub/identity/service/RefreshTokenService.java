package com.workhub.identity.service;

import com.workhub.identity.domain.RefreshToken;
import com.workhub.identity.domain.User;
import com.workhub.identity.repo.RefreshTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private static final int TOKEN_BYTES = 32;
    private static final long REFRESH_DAYS = 7;

    private final RefreshTokenRepository repo;
    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(RefreshTokenRepository repo) {
        this.repo = repo;
    }

    public String createRefreshToken(User user) {
        String rawToken = generateRawToken();
        repo.save(RefreshToken.builder()
                .id(UUID.randomUUID())
                .userId(user.getId())
                .tokenHash(hash(rawToken))
                .expiresAt(Instant.now().plus(REFRESH_DAYS, ChronoUnit.DAYS))
                .revoked(false)
                .build());
        return rawToken;
    }

    @Transactional
    public User validateAndRotate(String rawToken, java.util.function.Function<UUID, User> userLoader) {
        RefreshToken stored = repo.findByTokenHashAndRevokedFalse(hash(rawToken))
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (stored.getExpiresAt().isBefore(Instant.now())) {
            stored.setRevoked(true);
            repo.save(stored);
            throw new RuntimeException("Refresh token expired");
        }

        stored.setRevoked(true);
        repo.save(stored);

        User user = userLoader.apply(stored.getUserId());
        if (user == null || !Boolean.TRUE.equals(user.getActive())) {
            throw new RuntimeException("User inactive");
        }
        return user;
    }

    @Transactional
    public void revoke(String rawToken) {
        repo.findByTokenHashAndRevokedFalse(hash(rawToken)).ifPresent(token -> {
            token.setRevoked(true);
            repo.save(token);
        });
    }

    @Transactional
    public void revokeAllForUser(UUID userId) {
        repo.deleteByUserId(userId);
    }

    private String generateRawToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    static String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
