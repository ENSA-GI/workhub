package com.workhub.leave.config;

import com.workhub.leave.kafka.event.EmployeeCreatedEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.*;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrap;

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
}