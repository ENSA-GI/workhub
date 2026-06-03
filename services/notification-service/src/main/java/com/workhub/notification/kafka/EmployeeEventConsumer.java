package com.workhub.notification.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.workhub.notification.domain.Notification;
import com.workhub.notification.domain.NotificationType;
import com.workhub.notification.repo.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmployeeEventConsumer {

    private final ObjectMapper objectMapper;
    private final NotificationRepository notificationRepository;

    @KafkaListener(topics = "workhub.employee.events.v1", groupId = "notification-employee-group")
    public void onEmployeeEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            if (!event.has("employeeId")) return;
            UUID userId = event.has("userId") ? UUID.fromString(event.get("userId").asText()) : null;
            if (userId == null) return;
            Notification n = Notification.builder()
                    .id(UUID.randomUUID())
                    .userId(userId)
                    .type(NotificationType.EMPLOYEE_CREATED)
                    .title("Bienvenue dans WorkHub")
                    .message("Votre fiche employé a été créée. Consultez vos bulletins et congés dans votre espace.")
                    .isRead(false)
                    .createdAt(Instant.now())
                    .build();
            notificationRepository.save(n);
        } catch (Exception e) {
            log.error("Erreur consumer employee: {}", e.getMessage());
        }
    }
}
