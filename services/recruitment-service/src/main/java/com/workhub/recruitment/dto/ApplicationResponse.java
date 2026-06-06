package com.workhub.recruitment.dto;

import com.workhub.recruitment.domain.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ApplicationResponse {
    private UUID id;
    private UUID jobOfferId;
    private String jobTitle;
    private UUID candidateId;
    private String candidateFullName;
    private String cvUrl;
    private String coverLetterUrl;
    private ApplicationStatus status;
    private BigDecimal aiScore;
    private Instant appliedAt;
}
