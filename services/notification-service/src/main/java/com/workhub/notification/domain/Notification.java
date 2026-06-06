package com.workhub.notification.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Notification {

    @Id
    private UUID id;

    @Column(name="user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String message;

    @Column(name="related_entity_type")
    private String relatedEntityType;

    @Column(name="related_entity_id")
    private UUID relatedEntityId;

    @Column(name="is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name="read_at")
    private Instant readAt;

    @Column(name="created_at")
    private Instant createdAt;
}