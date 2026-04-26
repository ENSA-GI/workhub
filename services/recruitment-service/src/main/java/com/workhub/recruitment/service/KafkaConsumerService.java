package com.workhub.recruitment.service;

import com.workhub.recruitment.dto.CvAnalysisResult;
import com.workhub.recruitment.repo.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaConsumerService {

    private final ApplicationRepository applicationRepo;

    @KafkaListener(topics = "workhub.ai.events.v1", groupId = "recruitment-group")
    @Transactional
    public void consumeCvAnalysisResult(CvAnalysisResult result) {
        log.info("Received CV analysis result for application: {} with score: {}", result.getApplicationId(), result.getScore());
        
        applicationRepo.findById(result.getApplicationId()).ifPresent(app -> {
            app.setAiMatchingScore(result.getScore());
            // Vous pourrez ajouter ici le stockage des compétences extraites si besoin
            applicationRepo.save(app);
            log.info("Updated application {} with AI score.", result.getApplicationId());
        });
    }
}
