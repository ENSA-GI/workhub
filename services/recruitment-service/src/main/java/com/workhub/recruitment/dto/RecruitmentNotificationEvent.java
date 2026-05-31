package com.workhub.recruitment.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecruitmentNotificationEvent {
    private UUID candidateId;
    private String candidateEmail;
    private String candidateName;
    private String eventType; // INTERVIEW_SCHEDULED, HIRED, REJECTED
    private String jobTitle;
    private String date;
    private String timeSlot;
}
