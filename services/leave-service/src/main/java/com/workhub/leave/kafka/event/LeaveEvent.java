package com.workhub.leave.kafka.event;

import com.workhub.leave.domain.LeaveStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record LeaveEvent(
        String eventType,        // LeaveRequested / LeaveApproved / LeaveRejected
        UUID leaveRequestId,
        UUID employeeId,
        String leaveTypeName,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal requestedDays,
        LeaveStatus status,
        String reviewComment
) {}