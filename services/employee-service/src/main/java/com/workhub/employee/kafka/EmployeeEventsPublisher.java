package com.workhub.employee.kafka;

import com.workhub.employee.kafka.event.EmployeeCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class EmployeeEventsPublisher {

    private static final Logger log = LoggerFactory.getLogger(EmployeeEventsPublisher.class);
    public static final String TOPIC = "workhub.employee.events.v1";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public EmployeeEventsPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void employeeCreated(EmployeeCreatedEvent event) {
        try {
            kafkaTemplate.send(TOPIC, event.employeeId().toString(), event);
        } catch (Exception ex) {
            // IMPORTANT: on ne casse pas la création employé si Kafka a un souci
            log.error("Kafka publish failed for EmployeeCreatedEvent. employeeId={}", event.employeeId(), ex);
        }
    }
}