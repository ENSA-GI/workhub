package com.workhub.org.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record DepartmentResponse(
        UUID id,
        String name,
        String description,
        UUID organizationId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
