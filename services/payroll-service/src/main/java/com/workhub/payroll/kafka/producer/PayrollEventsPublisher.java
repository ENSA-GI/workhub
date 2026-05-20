package com.workhub.payroll.kafka.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workhub.payroll.kafka.event.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class PayrollEventsPublisher {

    // On utilise String pour la valeur (100% compatible avec le StringSerializer par défaut)
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    private static final String TOPIC = "workhub.payroll.events.v1";

    public void sendPayrollGenerated(PayrollGeneratedEvent event) {
        try {
            log.info("Publishing PayrollGeneratedEvent for org: {}", event.organizationId());

            // On transforme l'objet Java en chaîne de caractères JSON
            String jsonEvent = objectMapper.writeValueAsString(event);

            kafkaTemplate.send(TOPIC, event.organizationId().toString(), jsonEvent);
        } catch (Exception e) {
            log.error("Échec de la sérialisation/envoi de l'événement Kafka : {}", e.getMessage());
            // On ne bloque pas la transaction si la notification échoue
        }
    }

    public void sendPayslipGenerated(PayslipGeneratedEvent event) {
        try {
            log.info("Publishing PayslipGeneratedEvent for employee: {}", event.employeeId());

            String jsonEvent = objectMapper.writeValueAsString(event);

            kafkaTemplate.send(TOPIC, event.employeeId().toString(), jsonEvent);
        } catch (Exception e) {
            log.error("Échec de la sérialisation/envoi de l'événement Kafka : {}", e.getMessage());
        }
    }
}