package com.workhub.recruitment.dto;

import com.workhub.recruitment.domain.ContractType;
import com.workhub.recruitment.domain.JobOfferStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class JobOfferPublicResponse {
    private UUID id;
    private String title;
    private String description;
    private ContractType contractType;
    private String salaryRange;
    private String location;
    private Integer minExperience;
    private Instant publishedAt;
    private LocalDate deadline;
    private JobOfferStatus status;
    private java.util.List<ApplicationResponse> applications;
}
