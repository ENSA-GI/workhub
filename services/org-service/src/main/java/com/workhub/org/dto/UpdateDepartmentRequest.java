package com.workhub.org.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateDepartmentRequest(
        @NotBlank String name,
        String description,
        Boolean active
) {}
