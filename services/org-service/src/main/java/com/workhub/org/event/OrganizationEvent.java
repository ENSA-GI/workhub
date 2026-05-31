package com.workhub.org.event;

import java.util.UUID;

public record OrganizationEvent(
        UUID organizationId,
        String name,
        String eventType // CREATED, UPDATED, DELETED
) {}
