package com.workhub.recruitment.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name="applications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Application {
    @Id
    private UUID id;

    @Column(name="job_offer_id", nullable=false)
    private UUID jobOfferId;

    @Column(name="candidate_id", nullable=false)
    private UUID candidateId;

    @Column(name="cv_url", nullable=false)
    private String cvUrl;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    @Column(name="applied_at")
    private Instant appliedAt;
}