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
public class IdentityEventConsumer {

    private final ObjectMapper objectMapper;
    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    @KafkaListener(topics = "workhub.identity.events.v1", groupId = "notification-group")
    public void consumeIdentityEvent(String message) {
        try {
            String eventJson = message.startsWith("\"")
                    ? objectMapper.readValue(message, String.class)
                    : message;
            JsonNode event = objectMapper.readTree(eventJson);

            if (!event.hasNonNull("temporaryPassword")) {
                return;
            }

            UUID userId = UUID.fromString(event.get("userId").asText());
            String email = event.get("email").asText();
            String firstName = event.hasNonNull("firstName") ? event.get("firstName").asText() : "";
            String temporaryPassword = event.get("temporaryPassword").asText();

            String title = "Votre compte WorkHub a ete reactive";
            String greeting = firstName == null || firstName.isBlank() ? "Bonjour" : "Bonjour " + firstName;
            String content = String.format(
                    "%s,%n%nVotre compte WorkHub a ete reactive par l'administrateur de votre organisation.%n%n"
                            + "Vous pouvez vous connecter avec les identifiants suivants :%n"
                            + "Email : %s%n"
                            + "Mot de passe temporaire : %s%n%n"
                            + "Pour votre securite, changez ce mot de passe apres votre connexion.%n%n"
                            + "Cordialement,%nEquipe WorkHub",
                    greeting,
                    email,
                    temporaryPassword
            );

            notificationRepository.save(Notification.builder()
                    .id(UUID.randomUUID())
                    .userId(userId)
                    .type(NotificationType.PROFILE_UPDATED)
                    .title(title)
                    .message(content)
                    .relatedEntityType("USER")
                    .relatedEntityId(userId)
                    .isRead(false)
                    .createdAt(Instant.now())
                    .build());

            sendEmail(email, title, content);
            log.info("Reactivation email event processed for user {}", userId);
        } catch (Exception e) {
            log.error("Error while consuming identity Kafka event: {}", rootCauseMessage(e), e);
        }
    }

    private void sendEmail(String recipientEmail, String subject, String text) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.warn("Reactivation email not sent: no recipient email available");
            return;
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            if (senderEmail != null && !senderEmail.isBlank()) {
                mailMessage.setFrom(senderEmail);
            }
            mailMessage.setTo(recipientEmail);
            mailMessage.setSubject(subject);
            mailMessage.setText(text);
            mailSender.send(mailMessage);
            log.info("Reactivation email sent to {}", recipientEmail);
        } catch (Exception e) {
            log.error("Reactivation email failed for {}: {}. Check SMTP credentials and Gmail app password.",
                    recipientEmail, rootCauseMessage(e), e);
        }
    }

    private String rootCauseMessage(Throwable throwable) {
        Throwable current = throwable;
        while (current.getCause() != null) {
            current = current.getCause();
        }
        return current.getMessage() != null ? current.getMessage() : throwable.getMessage();
    }
}
