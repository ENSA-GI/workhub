package com.workhub.payroll.kafka.consumer;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmployeeEventsConsumer {

    /**
     * Consomme les événements d'employés si besoin
     * Pour l'instant: mise en place du listener uniquement
     *
     * Exemples d'événements possibles:
     * - EmployeeCreated
     * - EmployeeUpdated
     * - EmployeeDeleted
     *
     * À utiliser si la paie doit réagir aux changements d'employés
     */

    @KafkaListener(
        topics = "workhub.employee.events.v1",
        groupId = "payroll-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleEmployeeEvent(String message) {
        log.debug("Événement employé reçu (non traité pour l'instant): {}", message);
        // TODO: Implémenter si la paie doit réagir aux changements employés
    }
}

