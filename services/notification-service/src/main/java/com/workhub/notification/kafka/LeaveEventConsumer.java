package com.workhub.notification.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.workhub.notification.domain.Notification;
import com.workhub.notification.domain.NotificationType;
import com.workhub.notification.repo.NotificationRepository;
import com.workhub.notification.service.EmailTemplateService;
import com.workhub.notification.service.EmployeeInfoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class LeaveEventConsumer {

    private final ObjectMapper objectMapper;
    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;
    private final EmailTemplateService emailTemplateService;
    private final EmployeeInfoService employeeInfoService;

    @KafkaListener(topics = "workhub.leave.events.v1", groupId = "notification-group")
    public void consumeLeaveEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("eventType").asText();
            UUID employeeId = UUID.fromString(event.get("employeeId").asText());
            UUID requestId = UUID.fromString(event.get("leaveRequestId").asText());
            String leaveTypeName = event.get("leaveTypeName").asText("Congé");
            LocalDate startDate = LocalDate.parse(event.get("startDate").asText());
            LocalDate endDate = LocalDate.parse(event.get("endDate").asText());
            UUID reviewedBy = event.has("reviewedBy") && !event.get("reviewedBy").isNull() 
                    ? UUID.fromString(event.get("reviewedBy").asText()) 
                    : null;
            String reviewComment = event.has("reviewComment") && !event.get("reviewComment").isNull()
                    ? event.get("reviewComment").asText()
                    : null;
            
            NotificationType type;
            String title;

            switch (eventType) {
                case "LeaveRequested":
                    type = NotificationType.LEAVE_REQUEST;
                    title = "Nouvelle demande de congé";
                    handleLeaveRequested(employeeId, requestId, title, type);
                    break;
                case "LeaveApproved":
                    type = NotificationType.LEAVE_APPROVED;
                    title = "Demande de congé approuvée";
                    handleLeaveApproved(employeeId, requestId, leaveTypeName, startDate, endDate, reviewedBy, reviewComment, title, type);
                    break;
                case "LeaveRejected":
                    type = NotificationType.LEAVE_REJECTED;
                    title = "Demande de congé refusée";
                    handleLeaveRejected(employeeId, requestId, leaveTypeName, startDate, endDate, reviewedBy, reviewComment, title, type);
                    break;
                default:
                    log.warn("Type d'événement non géré : {}", eventType);
                    return;
            }

        } catch (Exception e) {
            log.error("Erreur lors de la consommation de l'événement Kafka: {}", e.getMessage(), e);
        }
    }

    private void handleLeaveRequested(UUID employeeId, UUID requestId, String title, NotificationType type) {
        Notification notification = Notification.builder()
                .id(UUID.randomUUID())
                .userId(employeeId)
                .type(type)
                .title(title)
                .message("Votre demande de congé a été soumise et est en attente de validation.")
                .relatedEntityType("LEAVE_REQUEST")
                .relatedEntityId(requestId)
                .isRead(false)
                .createdAt(Instant.now())
                .build();

        notificationRepository.save(notification);
        log.info("Notification LeaveRequested sauvegardée pour l'employé {}", employeeId);
    }

    private void handleLeaveApproved(UUID employeeId, UUID requestId, String leaveTypeName, 
                                     LocalDate startDate, LocalDate endDate, UUID reviewedBy, 
                                     String reviewComment, String title, NotificationType type) {
        // Sauvegarder la notification
        Notification notification = Notification.builder()
                .id(UUID.randomUUID())
                .userId(employeeId)
                .type(type)
                .title(title)
                .message("Votre demande de congé a été approuvée.")
                .relatedEntityType("LEAVE_REQUEST")
                .relatedEntityId(requestId)
                .isRead(false)
                .createdAt(Instant.now())
                .build();

        notificationRepository.save(notification);
        log.info("Notification LeaveApproved sauvegardée pour l'employé {}", employeeId);

        // Envoyer l'email
        String employeeEmail = employeeInfoService.getEmployeeEmail(employeeId);
        if (employeeEmail != null) {
            String employeeName = getEmployeeName(employeeId);
            String approverName = reviewedBy != null ? getEmployeeName(reviewedBy) : "Gestionnaire RH";
            String htmlContent = emailTemplateService.getApprovedLeaveEmailTemplate(
                    employeeName,
                    startDate,
                    endDate,
                    leaveTypeName,
                    approverName,
                    reviewComment
            );
            sendHtmlEmail(employeeEmail, title, htmlContent);
        } else {
            log.warn("Email non trouvé pour l'employé {} - email non envoyé", employeeId);
        }
    }

    private void handleLeaveRejected(UUID employeeId, UUID requestId, String leaveTypeName,
                                     LocalDate startDate, LocalDate endDate, UUID reviewedBy,
                                     String reviewComment, String title, NotificationType type) {
        // Sauvegarder la notification
        Notification notification = Notification.builder()
                .id(UUID.randomUUID())
                .userId(employeeId)
                .type(type)
                .title(title)
                .message("Votre demande de congé a été refusée.")
                .relatedEntityType("LEAVE_REQUEST")
                .relatedEntityId(requestId)
                .isRead(false)
                .createdAt(Instant.now())
                .build();

        notificationRepository.save(notification);
        log.info("Notification LeaveRejected sauvegardée pour l'employé {}", employeeId);

        // Envoyer l'email
        String employeeEmail = employeeInfoService.getEmployeeEmail(employeeId);
        if (employeeEmail != null) {
            String employeeName = getEmployeeName(employeeId);
            String approverName = reviewedBy != null ? getEmployeeName(reviewedBy) : "Gestionnaire RH";
            String htmlContent = emailTemplateService.getRejectedLeaveEmailTemplate(
                    employeeName,
                    startDate,
                    endDate,
                    leaveTypeName,
                    approverName,
                    reviewComment
            );
            sendHtmlEmail(employeeEmail, title, htmlContent);
        } else {
            log.warn("Email non trouvé pour l'employé {} - email non envoyé", employeeId);
        }
    }

    private String getEmployeeName(UUID employeeId) {
        try {
            EmployeeServiceClient.EmployeeDto employee = employeeInfoService.getEmployeeDetails(employeeId);
            if (employee != null && employee.getCin() != null) {
                return employee.getCin(); // Using CIN as a temporary identifier
            }
            return employeeId.toString();
        } catch (Exception e) {
            log.debug("Erreur lors de la récupération du nom de l'employé {}: {}", employeeId, e.getMessage());
            return employeeId.toString();
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom("rh@workhub.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML content
            
            mailSender.send(mimeMessage);
            log.info("Email HTML envoyé avec succès à {}", to);
        } catch (MessagingException e) {
            log.error("Erreur lors de l'envoi de l'email HTML à {}: {}", to, e.getMessage());
        } catch (Exception e) {
            log.error("Erreur inattendue lors de l'envoi de l'email: {}", e.getMessage());
        }
    }
}
