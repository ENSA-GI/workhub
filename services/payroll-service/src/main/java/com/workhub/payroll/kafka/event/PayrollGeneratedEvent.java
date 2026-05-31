package com.workhub.payroll.kafka.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PayrollGeneratedEvent(
        UUID payrollRunId,
        UUID organizationId,
        String month,
        Integer year,
        BigDecimal totalNetSalary,
        Integer employeeCount,
        String generatedBy, // ID du RH Manager
        LocalDateTime generatedAt
) {}