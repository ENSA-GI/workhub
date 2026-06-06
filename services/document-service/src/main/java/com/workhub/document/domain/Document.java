package com.workhub.document.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "documents")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Document {

    @Id
    private UUID id;

    @Column(name="organization_id", nullable=false)
    private UUID organizationId;

    @Column(name="owner_type", nullable=false)
    private String ownerType;

    @Column(name="owner_id", nullable=false)
    private UUID ownerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private DocumentType type;

    @Column(name="file_name", nullable=false)
    private String fileName;

    @Column(name="file_url", nullable=false)
    private String fileUrl;

    @Column(name="mime_type")
    private String mimeType;

    @Column(name="file_size")
    private Long fileSize;

    private String description;

    @Column(name="uploaded_by")
    private UUID uploadedBy;

    @Column(name="uploaded_at")
    private Instant uploadedAt;
}