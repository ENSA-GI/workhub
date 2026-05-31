package com.workhub.payroll.kafka;

import com.workhub.payroll.kafka.event.PayrollGeneratedEvent;
import com.workhub.payroll.kafka.producer.PayrollEventsPublisher;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.annotation.DirtiesContext;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Test d'intégration Kafka pour PayrollService
 *
 * Utilise EmbeddedKafka pour tester sans dépendre d'une instance Kafka réelle
 */
@SpringBootTest
@EmbeddedKafka(partitions = 1, brokerProperties = { "listeners=PLAINTEXT://localhost:29092" })
@DirtiesContext
public class PayrollKafkaIntegrationTest {

    @Autowired
    private PayrollEventsPublisher publisher;

    @Test
    public void testPublishPayrollGeneratedEvent() throws Exception {
        // Arrange
        UUID payrollRunId = UUID.randomUUID();
        UUID organizationId = UUID.randomUUID();

        PayrollGeneratedEvent event = new PayrollGeneratedEvent(
            payrollRunId,
            organizationId,
            "5",
            2026,
            new BigDecimal("125000.00"),
            10,
            "admin-user@company.com",
            LocalDateTime.now()
        );

        // Act
        assertNotNull(publisher, "PayrollEventsPublisher doit être injecté");
        publisher.sendPayrollGenerated(event);

        // Assert
        // Le message doit arriver dans le topic sans erreur
        // Voir logs: "Publishing PayrollGeneratedEvent for org: ..."
    }
}

