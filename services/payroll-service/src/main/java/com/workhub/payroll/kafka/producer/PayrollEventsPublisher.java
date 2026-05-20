package com.workhub.payroll.kafka.producer;

import com.workhub.payroll.kafka.event.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class PayrollEventsPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Le nom du topic défini dans ton script infra/kafka/init-topics.sh
    private static final String TOPIC = "workhub.payroll.events.v1";

    public void sendPayrollGenerated(PayrollGeneratedEvent event) {
        log.info("Publishing PayrollGeneratedEvent for org: {}", event.organizationId());
        // On utilise l'ID de l'organisation comme clé Kafka pour garantir
        // que les messages d'une même entreprise arrivent dans l'ordre
        kafkaTemplate.send(TOPIC, event.organizationId().toString(), event);
    }

    public void sendPayslipGenerated(PayslipGeneratedEvent event) {
        log.info("Publishing PayslipGeneratedEvent for employee: {}", event.employeeId());
        kafkaTemplate.send(TOPIC, event.employeeId().toString(), event);
    }
}