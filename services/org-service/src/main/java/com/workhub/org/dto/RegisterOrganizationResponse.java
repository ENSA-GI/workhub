package com.workhub.org.dto;

import java.util.UUID;

public record RegisterOrganizationResponse(
        UUID organizationId,
        String organizationName,
        UUID adminUserId,
        String adminEmail
) {}
