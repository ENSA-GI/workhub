package com.workhub.leave.kafka.event;

import java.util.UUID;

public record EmployeeCreatedEvent(
        UUID employeeId,
        UUID organizationId,
        UUID userId,
        String hireDate
) {}