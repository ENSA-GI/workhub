package com.workhub.leave.dto;

import com.workhub.leave.domain.LeaveStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record LeaveRequestResponse(
        UUID id,
        UUID employeeId,
        String leaveTypeName,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal requestedDays,
        String reason,
        LeaveStatus status,
        String reviewComment
) {}