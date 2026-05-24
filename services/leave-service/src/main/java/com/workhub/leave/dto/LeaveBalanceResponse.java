package com.workhub.leave.dto;

import java.math.BigDecimal;

public record LeaveBalanceResponse(
        int year,
        BigDecimal totalDays,
        BigDecimal usedDays,
        BigDecimal pendingDays,
        BigDecimal remainingDays,
        BigDecimal carriedOverDays
) {}