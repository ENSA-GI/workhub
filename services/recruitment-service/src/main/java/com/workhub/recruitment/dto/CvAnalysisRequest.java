package com.workhub.recruitment.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CvAnalysisRequest {
    private UUID applicationId;
    private String jobTitle;
    private String jobDescription;
    private String jobRequirements;
    private String cvUrl;
    private UUID organizationId;
}
