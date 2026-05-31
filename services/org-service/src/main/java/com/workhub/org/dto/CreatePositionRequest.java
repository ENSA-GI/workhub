package com.workhub.org.dto;

import com.workhub.org.domain.ProfessionalCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreatePositionRequest(
        @NotNull UUID organizationId,
        @NotBlank String title,
        String description,
        @NotNull ProfessionalCategory category
) {}
