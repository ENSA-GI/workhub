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
    private Integer score;
    private String summary;
}
