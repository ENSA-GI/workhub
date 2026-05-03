package com.workhub.identity.kafka;

import com.workhub.identity.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class EmployeeEventsConsumer {

    private static final Logger log = LoggerFactory.getLogger(EmployeeEventsConsumer.class);
    private final UserService userService;

    public EmployeeEventsConsumer(UserService userService) {
        this.userService = userService;
    }

    @KafkaListener(topics = "workhub.employee.events.v1", groupId = "identity-service")
    public void onEmployeeEvent(Map<String, Object> payload) {
        try {
            log.info("Consumed EmployeeCreatedEvent: {}", payload);
            // Pour l'instant juste log
            // Plus tard : tu peux parser le Map si besoin
        } catch (Exception e) {
            log.error("Error processing EmployeeCreatedEvent", e);
        }
    }
}