package com.workhub.employee.kafka;

import com.workhub.employee.domain.Employee;
import com.workhub.employee.kafka.event.EmployeeCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmployeeEventsPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String TOPIC = "workhub.employee.events.v1";

    public void publishEmployeeCreated(Employee employee) {
        EmployeeCreatedEvent event = new EmployeeCreatedEvent(
                employee.getId().toString(),
                employee.getOrganizationId().toString(),
                employee.getUserId().toString(),
                employee.getHireDate().toString()
        );

        kafkaTemplate.send(TOPIC, employee.getId().toString(), event)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("✅ Event EmployeeCreated publié pour employee {}", employee.getId());
                    } else {
                        log.error("❌ Échec publication event employee {}", employee.getId(), ex);
                    }
                });
    }
}