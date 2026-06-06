package com.workhub.audit.domain;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    private UUID id;

    @Column(name="organization_id")
    private UUID organizationId;

    @Column(name="user_id")
    private UUID userId;

    @Column(nullable=false)
    private String action;

    @Column(name="entity_type", nullable=false)
    private String entityType;

    @Column(name="entity_id")
    private UUID entityId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name="old_values", columnDefinition = "jsonb")
    private JsonNode oldValues;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name="new_values", columnDefinition = "jsonb")
    private JsonNode newValues;

    @Column(name="ip_address")
    private String ipAddress;

    @Column(name="user_agent")
    private String userAgent;

    private Instant timestamp;
}