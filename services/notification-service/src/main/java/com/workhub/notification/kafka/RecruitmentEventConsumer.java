package com.workhub.notification.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.workhub.notification.domain.Notification;
import com.workhub.notification.domain.NotificationType;
import com.workhub.notification.repo.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class RecruitmentEventConsumer {

    private final ObjectMapper objectMapper;
    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    @KafkaListener(topics = "workhub.recruitment.notifications.v1", groupId = "notification-group")
    public void consumeRecruitmentNotification(String message) {
        try {
            String eventJson = message.startsWith("\"")
                    ? objectMapper.readValue(message, String.class)
                    : message;
            JsonNode event = objectMapper.readTree(eventJson);

            log.info("Received recruitment notification event: {}", eventJson);

            if (!event.hasNonNull("userId") || !event.hasNonNull("eventType")) {
                log.warn("Missing userId or eventType in event: {}", eventJson);
                return;
            }

            UUID userId = UUID.fromString(event.get("userId").asText());
            String eventType = event.get("eventType").asText();
            String candidateEmail = event.hasNonNull("candidateEmail") ? event.get("candidateEmail").asText() : "";
            String candidateName = event.hasNonNull("candidateName") ? event.get("candidateName").asText() : "";
            String jobTitle = event.hasNonNull("jobTitle") ? event.get("jobTitle").asText() : "";

            String title = "";
            String content = "";
            NotificationType type = NotificationType.PROFILE_UPDATED;

            if ("INTERVIEW_SCHEDULED".equals(eventType)) {
                String date = event.hasNonNull("date") ? event.get("date").asText() : "";
                String timeSlot = event.hasNonNull("timeSlot") ? event.get("timeSlot").asText() : "";
                
                title = "Entretien planifié";
                content = String.format("Votre entretien pour le poste \"%s\" a été planifié pour le %s sur le créneau %s.", jobTitle, date, timeSlot);
                type = NotificationType.INTERVIEW_SCHEDULED;
            } else if ("HIRED".equals(eventType)) {
                title = "Candidature retenue";
                content = String.format("Félicitations %s, votre candidature pour le poste \"%s\" a été acceptée !", candidateName, jobTitle);
                type = NotificationType.PROFILE_UPDATED;
            } else if ("REJECTED".equals(eventType)) {
                title = "Mise à jour de votre candidature";
                content = String.format("Nous vous remercions pour votre intérêt. Malheureusement, votre candidature pour le poste \"%s\" n'a pas été retenue.", jobTitle);
                type = NotificationType.PROFILE_UPDATED;
            } else {
                return;
            }

            // Save database notification
            notificationRepository.save(Notification.builder()
                    .id(UUID.randomUUID())
                    .userId(userId)
                    .type(type)
                    .title(title)
                    .message(content)
                    .relatedEntityType("APPLICATION")
                    .relatedEntityId(event.hasNonNull("candidateId") ? UUID.fromString(event.get("candidateId").asText()) : null)
                    .isRead(false)
                    .createdAt(Instant.now())
                    .build());

            // Send email
            if (!candidateEmail.isEmpty()) {
                sendEmail(candidateEmail, title, content);
            }
            
            log.info("Recruitment notification successfully processed for user {} and eventType {}", userId, eventType);
        } catch (Exception e) {
            log.error("Error while consuming recruitment Kafka event: {}", e.getMessage(), e);
        }
    }

    private void sendEmail(String recipientEmail, String subject, String text) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            if (senderEmail != null && !senderEmail.isBlank()) {
                mailMessage.setFrom(senderEmail);
            }
            mailMessage.setTo(recipientEmail);
            mailMessage.setSubject(subject);
            mailMessage.setText(text);
            mailSender.send(mailMessage);
            log.info("Recruitment notification email sent to {}", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send recruitment notification email to {}: {}", recipientEmail, e.getMessage(), e);
        }
    }
}
