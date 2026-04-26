package com.workhub.recruitment.dto;

import lombok.*;
import java.util.UUID;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CvAnalysisResult {
    private UUID applicationId;
    private Double score;
    private List<String> extractedSkills;
    private String summary;
}
