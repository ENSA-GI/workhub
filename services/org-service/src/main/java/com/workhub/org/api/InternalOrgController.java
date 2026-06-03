package com.workhub.org.api;

import com.workhub.org.dto.OnboardOrganizationRequest;
import com.workhub.org.dto.OrganizationResponse;
import com.workhub.org.dto.OrganizationSettingsResponse;
import com.workhub.org.repo.DepartmentRepository;
import com.workhub.org.repo.OrganizationRepository;
import com.workhub.org.repo.PositionRepository;
import com.workhub.org.service.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Contrôleur réservé aux appels inter-microservices.
 * Ces routes commencent par /internal/** et ne sont PAS exposées
 * via la Gateway publique (qui ajoute le préfixe /api/).
 */
@RestController
@RequestMapping("/internal")
public class InternalOrgController {

    private final OrganizationRepository orgRepo;
    private final DepartmentRepository deptRepo;
    private final PositionRepository posRepo;
    private final OrganizationService organizationService;

    public InternalOrgController(OrganizationRepository orgRepo,
                                  DepartmentRepository deptRepo,
                                  PositionRepository posRepo,
                                  OrganizationService organizationService) {
        this.orgRepo = orgRepo;
        this.deptRepo = deptRepo;
        this.posRepo = posRepo;
        this.organizationService = organizationService;
    }

    @PostMapping("/orgs/onboard")
    @ResponseStatus(HttpStatus.CREATED)
    public OrganizationResponse onboard(@RequestBody @Valid OnboardOrganizationRequest req) {
        return organizationService.onboardOrganization(req);
    }

    @GetMapping("/orgs/{id}/leave-policy")
    public OrganizationSettingsResponse leavePolicy(@PathVariable UUID id) {
        return organizationService.getOrganizationSettings(id);
    }

    /**
     * Vérifie si une organisation existe et est active.
     * Utilisé par les autres services (ex: employee-service) pour valider un orgId.
     */
    @GetMapping("/orgs/{id}/exists")
    public ResponseEntity<Map<String, Object>> orgExists(@PathVariable UUID id) {
        boolean exists = orgRepo.findById(id)
                .map(org -> org.getActive() != null && org.getActive())
                .orElse(false);
        return ResponseEntity.ok(Map.of("id", id, "exists", exists));
    }

    /**
     * Vérifie si un département existe et est actif.
     */
    @GetMapping("/departments/{id}/exists")
    public ResponseEntity<Map<String, Object>> departmentExists(@PathVariable UUID id) {
        boolean exists = deptRepo.findById(id)
                .map(dept -> dept.getActive() != null && dept.getActive())
                .orElse(false);
        return ResponseEntity.ok(Map.of("id", id, "exists", exists));
    }

    /**
     * Vérifie si un poste existe et est actif.
     */
    @GetMapping("/positions/{id}/exists")
    public ResponseEntity<Map<String, Object>> positionExists(@PathVariable UUID id) {
        boolean exists = posRepo.findById(id)
                .map(pos -> pos.getActive() != null && pos.getActive())
                .orElse(false);
        return ResponseEntity.ok(Map.of("id", id, "exists", exists));
    }

    /**
     * Retourne l'orgId associé à un département.
     * Utile pour un service externe qui a seulement un departmentId.
     */
    @GetMapping("/departments/{id}/org")
    public ResponseEntity<Map<String, Object>> getDepartmentOrg(@PathVariable UUID id) {
        return deptRepo.findById(id)
                .map(dept -> ResponseEntity.ok(Map.<String, Object>of(
                        "departmentId", id,
                        "organizationId", dept.getOrganizationId()
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}
