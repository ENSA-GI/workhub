package com.workhub.identity.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "mfa_secrets")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MfaSecret {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false)
    private String secret;

    @Column(nullable = false)
    @Builder.Default
    private Boolean verified = false;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
