package com.workhub.notification.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.workhub.notification.domain.Notification;
import com.workhub.notification.domain.NotificationType;
import com.workhub.notification.repo.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class LeaveEventConsumer {

    private final ObjectMapper objectMapper;
    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @KafkaListener(topics = "workhub.leave.events.v1", groupId = "notification-group")
    public void consumeLeaveEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("eventType").asText();
            UUID employeeId = UUID.fromString(event.get("employeeId").asText());
            UUID requestId = UUID.fromString(event.get("leaveRequestId").asText());
            
            NotificationType type;
            String title;
            String content;

            switch (eventType) {
                case "LeaveRequested":
                    type = NotificationType.LEAVE_REQUEST;
                    title = "Nouvelle demande de congé";
                    content = "Une demande de congé a été soumise et est en attente de validation.";
                    break;
                case "LeaveApproved":
                    type = NotificationType.LEAVE_APPROVED;
                    title = "Demande de congé approuvée";
                    content = "Votre demande de congé a été approuvée par votre manager.";
                    break;
                case "LeaveRejected":
                    type = NotificationType.LEAVE_REJECTED;
                    title = "Demande de congé refusée";
                    content = "Votre demande de congé a été refusée.";
                    break;
                default:
                    log.warn("Type d'événement non géré : {}", eventType);
                    return;
            }

            Notification notification = Notification.builder()
                    .id(UUID.randomUUID())
                    .userId(employeeId)
                    .type(type)
                    .title(title)
                    .message(content)
                    .relatedEntityType("LEAVE_REQUEST")
                    .relatedEntityId(requestId)
                    .isRead(false)
                    .createdAt(Instant.now())
                    .build();

            notificationRepository.save(notification);
            log.info("Notification sauvegardée pour l'employé {}", employeeId);

            // Simulation envoi d'email
            sendEmail(employeeId, title, content);

        } catch (Exception e) {
            log.error("Erreur lors de la consommation de l'événement Kafka: {}", e.getMessage(), e);
        }
    }

    private void sendEmail(UUID employeeId, String subject, String text) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom("rh@workhub.com");
            mailMessage.setTo("employee-" + employeeId + "@example.com"); // Email fictif
            mailMessage.setSubject(subject);
            mailMessage.setText(text);
            mailSender.send(mailMessage);
            log.info("Email envoyé avec succès pour l'employé {}", employeeId);
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email: {}", e.getMessage());
        }
    }
}
