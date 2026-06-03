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
public class UserEventConsumer {

    private final ObjectMapper objectMapper;
    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @KafkaListener(topics = "workhub.identity.events.v1", groupId = "notification-group")
    public void consumeIdentityEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            if (event.has("verificationUrl")) {
                handleEmailVerification(event);
            } else if (event.has("invitationUrl")) {
                handleInvitation(event);
            } else if (event.has("role") && event.has("userId") && !event.has("verificationUrl")) {
                handleWelcome(event);
            }
        } catch (Exception e) {
            log.error("Erreur traitement événement identity: {}", e.getMessage(), e);
        }
    }

    private void handleEmailVerification(JsonNode event) {
        String email = event.get("email").asText();
        String url = event.get("verificationUrl").asText();
        UUID userId = UUID.fromString(event.get("userId").asText());
        sendEmail(email, "WorkHub - Confirmez votre email",
                "Bonjour,\n\nVeuillez confirmer votre adresse email en cliquant sur le lien :\n" + url
                        + "\n\nCe lien expire sous 48h.\n\nL'équipe WorkHub");
        saveNotification(userId, NotificationType.SYSTEM, "Confirmation email",
                "Un email de confirmation a été envoyé à " + email);
    }

    private void handleInvitation(JsonNode event) {
        String email = event.get("email").asText();
        String url = event.get("invitationUrl").asText();
        UUID userId = UUID.fromString(event.get("userId").asText());
        sendEmail(email, "WorkHub - Invitation RH Manager",
                "Bonjour,\n\nVous êtes invité en tant que RH Manager sur WorkHub.\n"
                        + "Activez votre compte : " + url + "\n\nL'équipe WorkHub");
        saveNotification(userId, NotificationType.SYSTEM, "Invitation envoyée",
                "Invitation RH Manager envoyée à " + email);
    }

    private void handleWelcome(JsonNode event) {
        if (!event.has("organizationId") || event.get("organizationId").isNull()) {
            return;
        }
        UUID userId = UUID.fromString(event.get("userId").asText());
        saveNotification(userId, NotificationType.WELCOME, "Bienvenue sur WorkHub",
                "Votre compte est actif. Consultez la documentation : https://docs.workhub.ma");
        String email = event.get("email").asText();
        sendEmail(email, "WorkHub - Bienvenue",
                "Bienvenue sur WorkHub !\n\nVotre organisation est prête. "
                        + "Documentation : https://docs.workhub.ma\n\nL'équipe WorkHub");
    }

    private void saveNotification(UUID userId, NotificationType type, String title, String message) {
        notificationRepository.save(Notification.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .isRead(false)
                .createdAt(Instant.now())
                .build());
    }

    private void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom("noreply@workhub.com");
            mail.setTo(to);
            mail.setSubject(subject);
            mail.setText(text);
            mailSender.send(mail);
        } catch (Exception e) {
            log.warn("Email non envoyé vers {}: {}", to, e.getMessage());
        }
    }
}
