package com.workhub.identity.service;

import com.workhub.identity.domain.User;
import com.workhub.identity.repo.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class AuthService {

    public enum LoginStatus {
        SUCCESS,
        EMAIL_NOT_VERIFIED,
        MFA_SETUP_REQUIRED,
        MFA_REQUIRED,
        ACCOUNT_INACTIVE,
        ORG_SETUP_REQUIRED
    }

    public record LoginResult(
            LoginStatus status,
            String token,
            User user,
            String message
    ) {}

    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final MfaService mfaService;

    @Value("${workhub.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public AuthService(UserRepository repo, PasswordEncoder passwordEncoder,
                       JwtEncoder jwtEncoder, MfaService mfaService) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.mfaService = mfaService;
    }

    public LoginResult authenticate(String email, String password, String mfaCode) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides"));

        if (!Boolean.TRUE.equals(user.getActive())) {
            return new LoginResult(LoginStatus.ACCOUNT_INACTIVE, null, null, "Compte désactivé");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides");
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            return new LoginResult(LoginStatus.EMAIL_NOT_VERIFIED, null, user,
                    "Veuillez confirmer votre adresse email avant de vous connecter");
        }

        if (!Boolean.TRUE.equals(user.getMfaEnabled())) {
            String setupToken = generateToken(user, "mfa_setup", 30);
            return new LoginResult(LoginStatus.MFA_SETUP_REQUIRED, setupToken, user,
                    "Configuration MFA obligatoire");
        }

        if (mfaCode == null || mfaCode.isBlank()) {
            String verifyToken = generateToken(user, "mfa_verify", 5);
            return new LoginResult(LoginStatus.MFA_REQUIRED, verifyToken, user,
                    "Code MFA requis");
        }

        if (!mfaService.verifyCode(user.getMfaSecret(), mfaCode)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Code MFA invalide");
        }

        user.setLastLogin(Instant.now());
        repo.save(user);

        if (user.getOrganizationId() == null && user.getRole().name().equals("PENDING_OWNER")) {
            String token = generateToken(user, "full", 1440);
            return new LoginResult(LoginStatus.ORG_SETUP_REQUIRED, token, user,
                    "Création de l'organisation requise");
        }

        String token = generateToken(user, "full", 1440);
        return new LoginResult(LoginStatus.SUCCESS, token, user, "Connexion réussie");
    }

    public String generateToken(User user) {
        return generateToken(user, "full", 1440);
    }

    public String generateToken(User user, String purpose, long minutes) {
        Instant now = Instant.now();
        JwtClaimsSet.Builder claims = JwtClaimsSet.builder()
                .issuer("workhub-identity-service")
                .issuedAt(now)
                .expiresAt(now.plus(minutes, ChronoUnit.MINUTES))
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("org_id", user.getOrganizationId() != null ? user.getOrganizationId().toString() : "")
                .claim("purpose", purpose);

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims.build())).getTokenValue();
    }

    public User requireUserFromPurposeToken(String token, String expectedPurpose) {
        // Validation done at controller via JwtDecoder - simplified: caller passes authenticated user id
        throw new UnsupportedOperationException("Use SecurityContext");
    }

    public String verificationUrl(String token) {
        return frontendBaseUrl + "/verify-email?token=" + token;
    }

    public String invitationUrl(String token) {
        return frontendBaseUrl + "/accept-invite?token=" + token;
    }
}
