package com.workhub.identity.kafka.event;

import java.util.UUID;

public record UserDeactivatedEvent(
        UUID userId
) {}