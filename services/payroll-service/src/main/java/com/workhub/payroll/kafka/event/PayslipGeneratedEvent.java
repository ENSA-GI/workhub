package com.workhub.payroll.kafka.event;

import java.math.BigDecimal;
import java.util.UUID;

public record PayslipGeneratedEvent(
        UUID payslipId,
        UUID employeeId,
        String employeeEmail,
        UUID organizationId,
        String month,
        Integer year,
        BigDecimal netSalary,
        String pdfPath
) {}
