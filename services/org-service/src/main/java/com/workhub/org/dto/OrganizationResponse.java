package com.workhub.org.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record OrganizationResponse(
        UUID id,
        String name,
        String legalName,
        String city,
        String industry,
        String country,
        Boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
