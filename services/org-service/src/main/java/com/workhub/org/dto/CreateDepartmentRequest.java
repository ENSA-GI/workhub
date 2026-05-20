package com.workhub.org.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateDepartmentRequest(
        @NotNull UUID organizationId,
        @NotBlank String name,
        String description
) {}
