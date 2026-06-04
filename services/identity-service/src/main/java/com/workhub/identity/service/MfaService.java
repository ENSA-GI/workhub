package com.workhub.identity.service;

import com.workhub.identity.domain.MfaSecret;
import com.workhub.identity.domain.Role;
import com.workhub.identity.domain.User;
import com.workhub.identity.repo.MfaSecretRepository;
import com.workhub.identity.repo.UserRepository;
import dev.samstevens.totp.code.*;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.Set;
import java.util.UUID;

@Service
public class MfaService {

    private static final Set<Role> MFA_REQUIRED_ROLES = Set.of(Role.ORG_ADMIN, Role.RH_MANAGER);

    private final MfaSecretRepository mfaRepo;
    private final UserRepository userRepo;
    private final SecretGenerator secretGenerator = new DefaultSecretGenerator();
    private final TimeProvider timeProvider = new SystemTimeProvider();
    private final CodeGenerator codeGenerator = new DefaultCodeGenerator();
    private final CodeVerifier codeVerifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
    private final QrGenerator qrGenerator = new ZxingPngQrGenerator();

    public MfaService(MfaSecretRepository mfaRepo, UserRepository userRepo) {
        this.mfaRepo = mfaRepo;
        this.userRepo = userRepo;
    }

    public boolean isMfaRequired(User user) {
        return MFA_REQUIRED_ROLES.contains(user.getRole());
    }

    public boolean requiresMfaChallenge(User user) {
        return isMfaRequired(user) && Boolean.TRUE.equals(user.getMfaEnabled());
    }

    @Transactional
    public MfaSetupResult startSetup(UUID userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String secret = secretGenerator.generate();
        mfaRepo.save(MfaSecret.builder()
                .userId(userId)
                .secret(secret)
                .verified(false)
                .build());

        QrData qrData = new QrData.Builder()
                .label(user.getEmail())
                .secret(secret)
                .issuer("WorkHub")
                .build();

        try {
            byte[] qrImage = qrGenerator.generate(qrData);
            String qrBase64 = Base64.getEncoder().encodeToString(qrImage);
            return new MfaSetupResult(secret, qrData.getUri(), qrBase64);
        } catch (QrGenerationException e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    @Transactional
    public void confirmSetup(UUID userId, String code) {
        MfaSecret mfa = mfaRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("MFA setup not started"));

        if (!codeVerifier.isValidCode(mfa.getSecret(), code)) {
            throw new RuntimeException("Invalid MFA code");
        }

        mfa.setVerified(true);
        mfaRepo.save(mfa);

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setMfaEnabled(true);
        userRepo.save(user);
    }

    public void verifyCode(UUID userId, String code) {
        MfaSecret mfa = mfaRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("MFA not configured"));

        if (!Boolean.TRUE.equals(mfa.getVerified())) {
            throw new RuntimeException("MFA not verified");
        }
        if (!codeVerifier.isValidCode(mfa.getSecret(), code)) {
            throw new RuntimeException("Invalid MFA code");
        }
    }

    @Transactional
    public void disable(UUID userId) {
        mfaRepo.deleteById(userId);
        userRepo.findById(userId).ifPresent(user -> {
            user.setMfaEnabled(false);
            userRepo.save(user);
        });
    }

    public record MfaSetupResult(String secret, String otpAuthUrl, String qrCodeBase64) {}
}
