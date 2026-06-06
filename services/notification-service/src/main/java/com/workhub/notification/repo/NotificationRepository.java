package com.workhub.notification.repo;

import com.workhub.notification.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<Notification> findByUserIdAndIsReadFalse(UUID userId);
}
