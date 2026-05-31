package com.workhub.kafka.consumer;

import com.workhub.kafka.event.LeaveEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class LeaveEventConsumer {

    @KafkaListener(topics = "leave-events", groupId = "workhub-group")
    public void onLeaveEvent(LeaveEvent event) {
        System.out.println("Événement reçu : " + event);

        switch (event.getStatus()) {
            case "SUBMITTED":
                System.out.println("Nouvelle demande → notifier RH Manager");
                break;
            case "APPROVED":
                System.out.println("Congé approuvé → notifier employé " + event.getEmployeeId());
                break;
            case "REJECTED":
                System.out.println("Congé refusé → notifier employé " + event.getEmployeeId());
                break;
            default:
                System.out.println("Statut inconnu : " + event.getStatus());
        }
    }
}