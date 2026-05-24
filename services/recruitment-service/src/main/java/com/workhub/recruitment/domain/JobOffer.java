package com.workhub.recruitment.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
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

    @Column(name = "required_skills", columnDefinition = "jsonb")
    private String requiredSkills;

    @Column(name = "min_experience")
    private Integer minExperience;

    @Column(name = "salary_range")
    private String salaryRange;

    @Column(name = "location")
    private String location;

    @Column(name = "deadline")
    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Column(name="contract_type", nullable=false)
    private ContractType contractType;

    @Enumerated(EnumType.STRING)
    private JobOfferStatus status;

    @Column(name="created_by", nullable=false)
    private UUID createdBy;

    @Column(name="created_at")
    private Instant createdAt;

    @Column(name="updated_at")
    private Instant updatedAt;

    @Column(name="published_at")
    private Instant publishedAt;
}