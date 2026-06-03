package com.workhub.org.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record OnboardOrganizationRequest(
        @NotBlank String name,
        @NotBlank String legalName,
        String industry,
        String taxId,
        String address,
        String city,
        String phone,
        String email,
        String country,
        UUID ownerUserId,
        Boolean setupDefaults
) {}
