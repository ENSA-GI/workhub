package com.workhub.kafka.producer;

import com.workhub.kafka.event.LeaveEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class LeaveEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public LeaveEventProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishLeaveSubmitted(LeaveEvent event) {
        System.out.println("Envoi événement congé soumis : " + event);
        kafkaTemplate.send("leave-events", event.getLeaveId().toString(), event);
    }

    public void publishLeaveApproved(LeaveEvent event) {
        System.out.println("Envoi événement congé approuvé : " + event);
        kafkaTemplate.send("leave-events", event.getLeaveId().toString(), event);
    }

    public void publishLeaveRejected(LeaveEvent event) {
        System.out.println("Envoi événement congé refusé : " + event);
        kafkaTemplate.send("leave-events", event.getLeaveId().toString(), event);
    }
}