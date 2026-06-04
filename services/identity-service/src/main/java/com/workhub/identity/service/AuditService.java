package com.workhub.identity.service;

import com.workhub.identity.domain.AuditLog;
import com.workhub.identity.repo.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuditService {

    private final AuditLogRepository repo;

    public AuditService(AuditLogRepository repo) {
        this.repo = repo;
    }

    public void log(UUID userId, String action, String details, String ipAddress) {
        repo.save(AuditLog.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .action(action)
                .details(details)
                .ipAddress(ipAddress)
                .build());
    }
}
