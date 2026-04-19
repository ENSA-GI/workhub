package com.workhub;

import com.workhub.kafka.event.LeaveEvent;
import com.workhub.kafka.producer.LeaveEventProducer;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;
import java.util.UUID;

@RestController
public class KafkaTestController {

    private final LeaveEventProducer producer;

    public KafkaTestController(LeaveEventProducer producer) {
        this.producer = producer;
    }

    @GetMapping("/test-kafka")
    public String testKafka() {
        LeaveEvent event = new LeaveEvent(
                UUID.randomUUID(),
                UUID.randomUUID(),
                "org-techvision",
                "SUBMITTED",
                "ANNUEL",
                LocalDate.of(2025, 7, 15),
                LocalDate.of(2025, 7, 19),
                5
        );

        producer.publishLeaveSubmitted(event);
        return "Message envoyé sur Kafka !";
    }
}