package com.workhub.org.dto;

import com.workhub.org.domain.ProfessionalCategory;

import java.time.LocalDateTime;
import java.util.UUID;

public record PositionResponse(
        UUID id,
        String title,
        String description,
        ProfessionalCategory category,
        UUID organizationId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
