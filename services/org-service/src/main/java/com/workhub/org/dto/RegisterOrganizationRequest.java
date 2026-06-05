package com.workhub.org.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterOrganizationRequest(
        // Organization fields
        @NotBlank String name,
        @NotBlank String legalName,
        String city,
        String industry,
        String country,

        // Admin user fields
        @NotBlank @Email String adminEmail,
        @NotBlank @Size(min = 8) String adminPassword,
        String adminFirstName,
        String adminLastName,
        String adminPhone
) {}
