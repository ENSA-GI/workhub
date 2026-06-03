package com.workhub.recruitment.service;

import com.workhub.recruitment.dto.CvAnalysisRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaProducerService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String TOPIC = "workhub.recruitment.events.v1";

    public void sendCvAnalysisRequest(CvAnalysisRequest request) {
        log.info("Sending CV analysis request for application: {}", request.getApplicationId());
        kafkaTemplate.send(TOPIC, request.getApplicationId().toString(), request);
    }

    public void sendRecruitmentNotification(com.workhub.recruitment.dto.RecruitmentNotificationEvent event) {
        log.info("Sending recruitment notification event for candidate: {} with type: {}", event.getCandidateId(), event.getEventType());
        kafkaTemplate.send("workhub.recruitment.notifications.v1", event.getCandidateId().toString(), event);
    }
}
