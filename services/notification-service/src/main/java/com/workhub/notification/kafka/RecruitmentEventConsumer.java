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
public class RecruitmentEventConsumer {

    private final ObjectMapper objectMapper;
    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @KafkaListener(topics = "workhub.recruitment.notifications.v1", groupId = "notification-group")
    public void consumeRecruitmentEvent(String message) {
        try {
            log.info("Receive recruitment notification event: {}", message);
            JsonNode event = objectMapper.readTree(message);
            
            UUID candidateId = UUID.fromString(event.get("candidateId").asText());
            String candidateEmail = event.get("candidateEmail").asText();
            String candidateName = event.get("candidateName").asText();
            String eventType = event.get("eventType").asText();
            String jobTitle = event.get("jobTitle").asText();
            
            NotificationType type;
            String title;
            String content;
            String mailSubject;
            String mailBody;

            if ("INTERVIEW_SCHEDULED".equals(eventType)) {
                String date = event.has("date") ? event.get("date").asText() : "";
                String timeSlot = event.has("timeSlot") ? event.get("timeSlot").asText() : "";
                type = NotificationType.INTERVIEW_SCHEDULED;
                title = "Convocation entretien";
                content = "Vous êtes convoqué à un entretien pour le poste \"" + jobTitle + "\" le " + date + " à " + timeSlot;
                mailSubject = "Convocation à un entretien - " + jobTitle;
                mailBody = "Bonjour " + candidateName + ",\n\nVous êtes convoqué à un entretien pour le poste '" + jobTitle + "' le " + date + " à " + timeSlot + ".\n\nCordialement,\nL'équipe WorkHub";
            } else if ("HIRED".equals(eventType)) {
                type = NotificationType.NEW_APPLICATION; // Or another appropriate fallback
                title = "Candidature acceptée";
                content = "Félicitations ! Votre candidature pour le poste \"" + jobTitle + "\" a été acceptée.";
                mailSubject = "Candidature retenue - " + jobTitle;
                mailBody = "Bonjour " + candidateName + ",\n\nNous avons le plaisir de vous informer que votre candidature pour le poste '" + jobTitle + "' a été retenue.\n\nCordialement,\nL'équipe WorkHub";
            } else if ("REJECTED".equals(eventType)) {
                type = NotificationType.NEW_APPLICATION; // Or another appropriate fallback
                title = "Candidature non retenue";
                content = "Votre candidature pour le poste \"" + jobTitle + "\" n'a pas été retenue.";
                mailSubject = "Mise à jour concernant votre candidature - " + jobTitle;
                mailBody = "Bonjour " + candidateName + ",\n\nNous vous remercions pour votre intérêt pour le poste '" + jobTitle + "'. Malheureusement, nous avons décidé de ne pas donner suite à votre candidature pour ce poste.\n\nCordialement,\nL'équipe WorkHub";
            } else {
                log.warn("Type d'événement de recrutement non géré : {}", eventType);
                return;
            }

            Notification notification = Notification.builder()
                    .id(UUID.randomUUID())
                    .userId(candidateId) // candidateId acts as the userId in notifications for candidates
                    .type(type)
                    .title(title)
                    .message(content)
                    .relatedEntityType("APPLICATION")
                    .isRead(false)
                    .createdAt(Instant.now())
                    .build();

            notificationRepository.save(notification);
            log.info("Notification de recrutement sauvegardée pour le candidat {} ({})", candidateName, candidateId);

            // Send actual email
            sendEmail(candidateEmail, mailSubject, mailBody);

        } catch (Exception e) {
            log.error("Erreur lors de la consommation de l'événement Kafka de recrutement: {}", e.getMessage(), e);
        }
    }

    private void sendEmail(String toEmail, String subject, String text) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom("recrutement@workhub.com");
            mailMessage.setTo(toEmail);
            mailMessage.setSubject(subject);
            mailMessage.setText(text);
            mailSender.send(mailMessage);
            log.info("Email envoyé avec succès à {}", toEmail);
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email de recrutement à {}: {}", toEmail, e.getMessage());
        }
    }
}
