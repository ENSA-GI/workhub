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
        String email,
        String phone,
        String taxId,
        String plan,
        Integer maxEmployees,
        Boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
