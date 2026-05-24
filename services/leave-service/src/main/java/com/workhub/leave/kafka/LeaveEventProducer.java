package com.workhub.leave.kafka;

import com.workhub.leave.kafka.event.LeaveEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaveEventProducer {

    private static final String TOPIC = "workhub.leave.events.v1";

    private final KafkaTemplate<String, LeaveEvent> kafkaTemplate;

    public void publish(LeaveEvent event) {
        kafkaTemplate.send(TOPIC, event.employeeId().toString(), event);
        log.info("Leave event published: {} for employee {}",
                event.eventType(), event.employeeId());
    }
}
