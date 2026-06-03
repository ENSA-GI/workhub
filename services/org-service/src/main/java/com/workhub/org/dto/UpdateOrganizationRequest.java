package com.workhub.org.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateOrganizationRequest(
        @NotBlank String name,
        @NotBlank String legalName,
        String city,
        String industry,
        String country,
        String taxId,
        String address,
        String phone,
        String email,
        Boolean active
) {}
