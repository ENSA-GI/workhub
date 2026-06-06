package com.workhub.identity.kafka.event;

import java.util.UUID;

public record UserUpdatedEvent(
        UUID userId,
        String email,
        String role
) {}