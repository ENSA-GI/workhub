package com.workhub.leave.config;

import com.workhub.leave.kafka.event.EmployeeCreatedEvent;
import com.workhub.leave.kafka.event.LeaveEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.*;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrap;

    // ============ CONSUMER (déjà là) ============

    @Bean
    public ConsumerFactory<String, EmployeeCreatedEvent> employeeCreatedConsumerFactory() {
        JsonDeserializer<EmployeeCreatedEvent> json = new JsonDeserializer<>(EmployeeCreatedEvent.class);
        json.addTrustedPackages("*");

        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrap);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "leave-service");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(), json);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, EmployeeCreatedEvent> employeeCreatedKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, EmployeeCreatedEvent> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(employeeCreatedConsumerFactory());
        return factory;
    }

    // ============ PRODUCER (nouveau) ============

    @Bean
    public ProducerFactory<String, LeaveEvent> leaveEventProducerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrap);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return new DefaultKafkaProducerFactory<>(props, new StringSerializer(), new JsonSerializer<>(mapper));
    }

    @Bean
    public KafkaTemplate<String, LeaveEvent> kafkaTemplate() {
        return new KafkaTemplate<>(leaveEventProducerFactory());
    }
}
