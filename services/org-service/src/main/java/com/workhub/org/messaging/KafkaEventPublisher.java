package com.workhub.org.messaging;

import com.workhub.org.event.DepartmentEvent;
import com.workhub.org.event.OrganizationEvent;
import com.workhub.org.event.PositionEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class KafkaEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public KafkaEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishOrganizationEvent(OrganizationEvent event) {
        String topic = "organization-events";
        String key = event.organizationId().toString();
        log.info("Publishing OrganizationEvent to topic {}: {}", topic, event);
        try {
            kafkaTemplate.send(topic, key, event);
        } catch (Exception e) {
            log.error("Failed to publish OrganizationEvent to Kafka: {}", e.getMessage(), e);
        }
    }

    public void publishDepartmentEvent(DepartmentEvent event) {
        String topic = "department-events";
        String key = event.departmentId().toString();
        log.info("Publishing DepartmentEvent to topic {}: {}", topic, event);
        try {
            kafkaTemplate.send(topic, key, event);
        } catch (Exception e) {
            log.error("Failed to publish DepartmentEvent to Kafka: {}", e.getMessage(), e);
        }
    }

    public void publishPositionEvent(PositionEvent event) {
        String topic = "position-events";
        String key = event.positionId().toString();
        log.info("Publishing PositionEvent to topic {}: {}", topic, event);
        try {
            kafkaTemplate.send(topic, key, event);
        } catch (Exception e) {
            log.error("Failed to publish PositionEvent to Kafka: {}", e.getMessage(), e);
        }
    }
}
