package com.workhub.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiEvent {
    private UUID applicationId;
    private UUID jobOfferId;
    private String organizationId;
    private String action;       // CV_UPLOADED, ANALYSIS_DONE
    private String cvPath;
    private Double matchScore;
}