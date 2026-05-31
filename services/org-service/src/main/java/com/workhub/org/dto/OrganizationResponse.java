package com.workhub.org.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record OrganizationResponse(
        UUID id,
        String name,
        String legalName,
        String city,
        Boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
