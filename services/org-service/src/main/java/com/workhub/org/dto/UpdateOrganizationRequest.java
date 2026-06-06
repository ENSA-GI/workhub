package com.workhub.org.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateOrganizationRequest(
        @NotBlank String name,
        @NotBlank String legalName,
        String city,
        String industry,
        String country,
        String email,
        String phone,
        String taxId,
        String plan,
        Integer maxEmployees,
        Boolean active
) {}
