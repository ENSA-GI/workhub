package com.workhub.notification.api;

import com.workhub.notification.domain.Notification;
import com.workhub.notification.domain.NotificationType;
import com.workhub.notification.repo.NotificationRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@Slf4j
public class NotificationController {

    private final NotificationRepository repo;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    public NotificationController(NotificationRepository repo, JavaMailSender mailSender) {
        this.repo = repo;
        this.mailSender = mailSender;
    }

    public record CreateNotificationRequest(
            @NotNull UUID userId,
            @NotNull NotificationType type,
            @NotBlank String title,
            @NotBlank String message,
            String relatedEntityType,
            UUID relatedEntityId
    ) {}

    public record SendTestEmailRequest(
            @NotBlank @Email String to,
            @NotBlank String subject,
            @NotBlank String body
    ) {}

    @GetMapping("/notifications")
    public List<Notification> list(@RequestParam UUID userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @PostMapping("/notifications")
    public Notification create(@RequestBody @Valid CreateNotificationRequest req) {
        Notification n = Notification.builder()
                .id(UUID.randomUUID())
                .userId(req.userId())
                .type(req.type())
                .title(req.title())
                .message(req.message())
                .relatedEntityType(req.relatedEntityType())
                .relatedEntityId(req.relatedEntityId())
                .isRead(false)
                .createdAt(Instant.now())
                .build();
        return repo.save(n);
    }

    @PostMapping("/notifications/{id}/read")
    public Notification markRead(@PathVariable UUID id) {
        Notification n = repo.findById(id).orElseThrow();
        n.setIsRead(true);
        n.setReadAt(Instant.now());
        return repo.save(n);
    }

    @PostMapping("/notifications/read-all")
    public List<Notification> markAllRead(@RequestParam UUID userId) {
        Instant now = Instant.now();
        List<Notification> unread = repo.findByUserIdAndIsReadFalse(userId);
        unread.forEach(n -> {
            n.setIsRead(true);
            n.setReadAt(now);
        });
        return repo.saveAll(unread);
    }

    @DeleteMapping("/notifications/{id}")
    public void delete(@PathVariable UUID id) {
        repo.deleteById(id);
    }

    @PostMapping("/notifications/send-test-email")
    public ResponseEntity<String> sendTestEmail(@RequestBody @Valid SendTestEmailRequest req) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            if (senderEmail != null && !senderEmail.isBlank()) {
                msg.setFrom(senderEmail);
            }
            msg.setTo(req.to());
            msg.setSubject(req.subject());
            msg.setText(req.body());
            mailSender.send(msg);
            return ResponseEntity.ok("sent from " + (senderEmail == null || senderEmail.isBlank() ? "configured SMTP account" : senderEmail));
        } catch (Exception e) {
            String diagnostic = rootCauseMessage(e);
            log.error("SMTP test email failed: {}", diagnostic, e);
            return ResponseEntity.status(502).body("SMTP_SEND_FAILED: " + diagnostic);
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
