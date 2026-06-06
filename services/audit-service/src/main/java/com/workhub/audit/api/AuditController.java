package com.workhub.audit.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.workhub.audit.domain.AuditLog;
import com.workhub.audit.repo.AuditLogRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditController {

    private final AuditLogRepository repo;

    public AuditController(AuditLogRepository repo) {
        this.repo = repo;
    }

    public record CreateAuditLogRequest(
            UUID organizationId,
            UUID userId,
            @NotBlank String action,
            @NotBlank String entityType,
            UUID entityId,
            JsonNode oldValues,
            JsonNode newValues,
            String ipAddress,
            String userAgent
    ) {}

    @GetMapping
    public List<AuditLog> list(
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) UUID entityId
    ) {
        if (entityType != null && entityId != null) {
            return repo.findByEntityTypeAndEntityId(entityType, entityId);
        }
        if (organizationId != null) {
            return repo.findByOrganizationIdOrderByTimestampDesc(organizationId);
        }
        return repo.findAll();
    }

    @PostMapping
    public AuditLog create(@RequestBody @Valid CreateAuditLogRequest req) {
        AuditLog log = AuditLog.builder()
                .id(UUID.randomUUID())
                .organizationId(req.organizationId())
                .userId(req.userId())
                .action(req.action())
                .entityType(req.entityType())
                .entityId(req.entityId())
                .oldValues(req.oldValues())
                .newValues(req.newValues())
                .ipAddress(req.ipAddress())
                .userAgent(req.userAgent())
                .timestamp(Instant.now())
                .build();
        return repo.save(log);
    }
}