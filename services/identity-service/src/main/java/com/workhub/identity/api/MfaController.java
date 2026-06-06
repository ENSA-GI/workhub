package com.workhub.identity.api;

import com.workhub.identity.service.MfaService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/mfa")
public class MfaController {

    private final MfaService mfaService;

    public MfaController(MfaService mfaService) {
        this.mfaService = mfaService;
    }

    public record ConfirmRequest(@NotBlank String code) {}

    @PostMapping("/setup")
    public MfaService.MfaSetupResult setup(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return mfaService.startSetup(userId);
    }

    @PostMapping("/setup/confirm")
    public Map<String, String> confirmSetup(@AuthenticationPrincipal Jwt jwt,
                                            @RequestBody ConfirmRequest req) {
        UUID userId = UUID.fromString(jwt.getSubject());
        mfaService.confirmSetup(userId, req.code());
        return Map.of("message", "MFA enabled");
    }

    @DeleteMapping
    public Map<String, String> disable(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        mfaService.disable(userId);
        return Map.of("message", "MFA disabled");
    }
}
