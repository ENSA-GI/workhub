package com.workhub.org.event;

import java.util.UUID;

public record DepartmentEvent(
        UUID departmentId,
        UUID organizationId,
        String name,
        UUID managerEmployeeId,
        String eventType // CREATED, UPDATED, DELETED
) {}
