package com.workhub.org.event;

import java.util.UUID;

public record PositionEvent(
        UUID positionId,
        UUID organizationId,
        String title,
        String eventType // CREATED, UPDATED, DELETED
) {}
