package com.workhub.identity.kafka.event;

import java.util.UUID;

public record UserReactivatedEvent(
        UUID userId,
        UUID organizationId,
        String email,
        String firstName,
        String lastName,
        String role,
        String temporaryPassword
) {}
