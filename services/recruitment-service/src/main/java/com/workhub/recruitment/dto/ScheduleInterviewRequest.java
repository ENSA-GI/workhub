package com.workhub.recruitment.dto;

import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
public class ScheduleInterviewRequest {
    private UUID applicationId;
    private Instant scheduledAt;
    private String timeSlot;
}
