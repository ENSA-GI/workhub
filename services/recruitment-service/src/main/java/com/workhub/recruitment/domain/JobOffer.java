package com.workhub.recruitment.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name="job_offers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobOffer {
    @Id
    private UUID id;

    @Column(name="organization_id", nullable=false)
    private UUID organizationId;

    @Column(nullable=false)
    private String title;

    @Column(nullable=false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name="contract_type", nullable=false)
    private ContractType contractType;

    @Enumerated(EnumType.STRING)
    private JobOfferStatus status;

    @Column(name="created_by", nullable=false)
    private UUID createdBy;

    @Column(name="published_at")
    private Instant publishedAt;
}