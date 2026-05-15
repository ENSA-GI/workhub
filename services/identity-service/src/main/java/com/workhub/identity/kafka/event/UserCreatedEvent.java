package com.workhub.identity.kafka.event;

import java.util.UUID;

public record UserCreatedEvent(
        UUID userId,
        String clerkId,
        UUID organizationId,
        String email,
        String role
) {}