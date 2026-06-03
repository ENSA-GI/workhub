package com.workhub.identity.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class User {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String password;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(nullable = false, unique = true)
    private String email;

    private String firstName;
    private String lastName;
    private String phone;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "role_enum")
    private Role role;

    @Column(nullable = false)
    private Boolean active;

    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified;

    private Instant lastLogin;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}