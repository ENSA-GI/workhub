package com.workhub.org.dto;

import com.workhub.org.domain.ProfessionalCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdatePositionRequest(
        @NotBlank String title,
        String description,
        @NotNull ProfessionalCategory category,
        Boolean active
) {}
