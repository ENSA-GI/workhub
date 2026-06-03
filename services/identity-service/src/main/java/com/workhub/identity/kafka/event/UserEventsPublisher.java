package com.workhub.identity.kafka;

import com.workhub.identity.kafka.event.EmailVerificationEvent;
import com.workhub.identity.kafka.event.UserCreatedEvent;
import com.workhub.identity.kafka.event.UserDeactivatedEvent;
import com.workhub.identity.kafka.event.UserInvitationEvent;
import com.workhub.identity.kafka.event.UserUpdatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class UserEventsPublisher {

    private static final Logger log = LoggerFactory.getLogger(UserEventsPublisher.class);
    public static final String TOPIC = "workhub.identity.events.v1";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public UserEventsPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void userCreated(UserCreatedEvent event) {
        try {
            kafkaTemplate.send(TOPIC, event.userId().toString(), event);
            log.info("Published UserCreatedEvent: userId={}", event.userId());
        } catch (Exception ex) {
            log.error("Kafka publish failed for UserCreatedEvent. userId={}", event.userId(), ex);
        }
    }

    public void userUpdated(UserUpdatedEvent event) {
        try {
            kafkaTemplate.send(TOPIC, event.userId().toString(), event);
            log.info("Published UserUpdatedEvent: userId={}", event.userId());
        } catch (Exception ex) {
            log.error("Kafka publish failed for UserUpdatedEvent. userId={}", event.userId(), ex);
        }
    }

    public void userDeactivated(UserDeactivatedEvent event) {
        try {
            kafkaTemplate.send(TOPIC, event.userId().toString(), event);
            log.info("Published UserDeactivatedEvent: userId={}", event.userId());
        } catch (Exception ex) {
            log.error("Kafka publish failed for UserDeactivatedEvent. userId={}", event.userId(), ex);
        }
    }

    public void emailVerification(EmailVerificationEvent event) {
        try {
            kafkaTemplate.send(TOPIC, event.userId().toString(), event);
            log.info("Published EmailVerificationEvent: userId={}", event.userId());
        } catch (Exception ex) {
            log.error("Kafka publish failed for EmailVerificationEvent. userId={}", event.userId(), ex);
        }
    }

    public void userInvitation(UserInvitationEvent event) {
        try {
            kafkaTemplate.send(TOPIC, event.userId().toString(), event);
            log.info("Published UserInvitationEvent: userId={}", event.userId());
        } catch (Exception ex) {
            log.error("Kafka publish failed for UserInvitationEvent. userId={}", event.userId(), ex);
        }
    }
}