package com.workhub.identity.api;

import com.workhub.identity.domain.Role;
import com.workhub.identity.domain.User;
import com.workhub.identity.service.AuthService;
import com.workhub.identity.service.UserService;
import com.workhub.identity.util.SecurityUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/onboarding")
public class OnboardingController {

    private final UserService userService;
    private final AuthService authService;
    private final RestClient orgClient;

    public record CreateOrganizationOnboardRequest(
            @NotBlank String name,
            @NotBlank String legalName,
            String industry,
            String taxId,
            String address,
            String city,
            String phone,
            String email,
            String country
    ) {}

    public OnboardingController(UserService userService, AuthService authService,
                                @Value("${workhub.services.org-url:http://localhost:8081}") String orgBaseUrl) {
        this.userService = userService;
        this.authService = authService;
        this.orgClient = RestClient.builder().baseUrl(orgBaseUrl).build();
    }

    @PostMapping("/organization")
    public Map<String, Object> createOrganization(@AuthenticationPrincipal Jwt jwt,
                                                  @RequestBody @Valid CreateOrganizationOnboardRequest req) {
        UUID userId = UUID.fromString(jwt.getSubject());
        User user = userService.getUser(userId);
        if (user.getRole() != Role.PENDING_OWNER && user.getRole() != Role.ORG_ADMIN) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Seul un propriétaire peut créer une organisation");
        }
        if (user.getOrganizationId() != null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.CONFLICT, "Organisation déjà associée");
        }

        java.util.Map<String, Object> orgBody = new java.util.LinkedHashMap<>();
        orgBody.put("name", req.name());
        orgBody.put("legalName", req.legalName());
        orgBody.put("industry", req.industry());
        orgBody.put("taxId", req.taxId());
        orgBody.put("address", req.address());
        orgBody.put("city", req.city());
        orgBody.put("phone", req.phone());
        orgBody.put("email", req.email() != null ? req.email() : user.getEmail());
        orgBody.put("country", req.country() != null ? req.country() : "Maroc");
        orgBody.put("ownerUserId", userId);
        orgBody.put("setupDefaults", true);

        ResponseEntity<java.util.Map> response = orgClient.post()
                .uri("/internal/orgs/onboard")
                .contentType(MediaType.APPLICATION_JSON)
                .body(orgBody)
                .retrieve()
                .toEntity(java.util.Map.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.BAD_GATEWAY, "Échec création organisation");
        }

        UUID orgId = UUID.fromString(response.getBody().get("id").toString());
        User updated = userService.linkOrganizationAndPromote(userId, orgId);
        String token = authService.generateToken(updated);

        return Map.of(
                "organization", response.getBody(),
                "user", updated,
                "token", token,
                "message", "Organisation créée avec succès"
        );
    }

    @PostMapping("/setup-rh")
    public Map<String, Object> setupRhDefaults(@AuthenticationPrincipal Jwt jwt,
                                               @RequestParam UUID organizationId) {
        SecurityUtils.validateOrganizationAccess(organizationId);
        ResponseEntity<Map> response = orgClient.post()
                .uri("/api/orgs/{id}/onboarding/setup-defaults", organizationId)
                .retrieve()
                .toEntity(Map.class);
        return response.getBody() != null ? response.getBody() : Map.of();
    }
}
