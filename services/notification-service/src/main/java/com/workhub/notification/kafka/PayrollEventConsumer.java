package com.workhub.notification.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workhub.notification.domain.Notification;
import com.workhub.notification.domain.NotificationType;
import com.workhub.notification.kafka.event.PayslipGeneratedEvent;
import com.workhub.notification.repo.NotificationRepository;
import com.workhub.notification.service.PayslipStorageService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PayrollEventConsumer {

    private final ObjectMapper objectMapper;
    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;
    private final PayslipStorageService payslipStorageService;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    @KafkaListener(topics = "workhub.payroll.events.v1", groupId = "notification-group")
    public void consumePayrollEvent(String message) {
        try {
            if (message.contains("payslipId") && message.contains("pdfPath")) {
                String eventJson = message.startsWith("\"")
                        ? objectMapper.readValue(message, String.class)
                        : message;
                PayslipGeneratedEvent event = objectMapper.readValue(eventJson, PayslipGeneratedEvent.class);

                UUID employeeId = event.employeeId();
                String title = "Votre bulletin de paie est disponible";
                String content = String.format(
                        "Bonjour,%n%nVotre bulletin de paie pour la periode %s/%s est disponible.%n%n"
                                + "Vous le trouverez en piece jointe de cet email. Il reste egalement accessible depuis votre espace WorkHub.%n%n"
                                + "Cordialement,%nService Ressources Humaines",
                        event.month(),
                        event.year()
                );

                Notification notification = Notification.builder()
                        .id(UUID.randomUUID())
                        .userId(employeeId)
                        .type(NotificationType.PAYROLL_GENERATED)
                        .title(title)
                        .message(content)
                        .relatedEntityType("PAYSLIP")
                        .relatedEntityId(event.payslipId())
                        .isRead(false)
                        .createdAt(Instant.now())
                        .build();

                notificationRepository.save(notification);
                log.info("Payroll notification saved for employee {} and payslip {}", employeeId, event.payslipId());

                sendEmail(employeeId, event.employeeEmail(), title, content, event);
            } else {
                log.info("Payroll event ignored by notification service: {}", message);
            }
        } catch (Exception e) {
            log.error("Error while consuming payroll Kafka event: {}", rootCauseMessage(e), e);
        }
    }

    private void sendEmail(UUID employeeId, String employeeEmail, String subject, String text, PayslipGeneratedEvent event) {
        if (employeeEmail == null || employeeEmail.isBlank()) {
            log.warn("Payroll email not sent: no recipient email available for employee {}", employeeId);
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            if (senderEmail != null && !senderEmail.isBlank()) {
                helper.setFrom(senderEmail);
            }
            helper.setTo(employeeEmail);
            helper.setSubject(subject);
            helper.setText(text, false);

            byte[] pdf = payslipStorageService.download(event.pdfPath());
            if (pdf.length > 0) {
                String filename = String.format("bulletin_paie_%s_%s.pdf", event.month(), event.year());
                helper.addAttachment(filename, new ByteArrayResource(pdf));
            }

            mailSender.send(mimeMessage);
            log.info("Payroll email sent successfully for employee {} to {}", employeeId, employeeEmail);
        } catch (Exception e) {
            log.error("Payroll email failed for employee {} to {}: {}. Check SMTP credentials and Gmail app password.",
                    employeeId, employeeEmail, rootCauseMessage(e), e);
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
