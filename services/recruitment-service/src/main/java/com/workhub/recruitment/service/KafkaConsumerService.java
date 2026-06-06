package com.workhub.recruitment.service;

import com.workhub.recruitment.dto.CvAnalysisResult;
import com.workhub.recruitment.repo.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaConsumerService {

    private final ApplicationRepository applicationRepo;

    @jakarta.annotation.PostConstruct
    public void init() {
        log.info("KafkaConsumerService initialized and listening to workhub.recruitment.analysis.v1");
    }

    @KafkaListener(topics = "workhub.recruitment.analysis.v1", groupId = "recruitment-group-v3")
    @Transactional
    public void consumeCvAnalysisResult(CvAnalysisResult result) {
        log.info("Received CV analysis result for application: {} with score: {}", result.getApplicationId(), result.getScore());
        
        applicationRepo.findById(result.getApplicationId()).ifPresent(app -> {
            app.setAiScore(BigDecimal.valueOf(result.getScore()));
            app.setAiSummary(result.getSummary());
            app.setUpdatedAt(Instant.now());
            applicationRepo.save(app);
            log.info("Updated application {} with AI score and summary.", result.getApplicationId());
        });
    }
}
