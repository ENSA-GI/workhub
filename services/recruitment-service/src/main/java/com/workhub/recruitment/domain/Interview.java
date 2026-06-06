package com.workhub.recruitment.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {
    @Id
    private UUID id;
    private UUID applicationId;
    private Instant scheduledAt;
    @Column(name = "time_slot")
    private String timeSlot;
    @Enumerated(EnumType.STRING)
    private InterviewStatus status;
    private String feedback;
}
