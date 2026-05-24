package com.workhub.leave.dto;

import java.time.LocalDate;
import java.util.UUID;

public record LeaveRequestDTO(
        UUID employeeId,
        UUID leaveTypeId,
        LocalDate startDate,
        LocalDate endDate,
        String reason
) {}