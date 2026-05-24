package com.workhub.leave.dto;

import com.workhub.leave.domain.LeaveStatus;
import java.util.UUID;

public record ReviewDTO(
        LeaveStatus decision,
        String comment,
        UUID reviewedBy
) {}