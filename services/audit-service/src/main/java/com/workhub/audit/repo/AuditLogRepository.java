package com.workhub.audit.repo;

import com.workhub.audit.domain.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByOrganizationIdOrderByTimestampDesc(UUID organizationId);
    List<AuditLog> findByEntityTypeAndEntityId(String entityType, UUID entityId);
}