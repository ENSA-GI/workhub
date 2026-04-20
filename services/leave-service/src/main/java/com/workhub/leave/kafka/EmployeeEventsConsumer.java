package com.workhub.leave.kafka;

import com.workhub.leave.domain.LeaveBalance;
import com.workhub.leave.kafka.event.EmployeeCreatedEvent;
import com.workhub.leave.repo.LeaveBalanceRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class EmployeeEventsConsumer {

    private final LeaveBalanceRepository repo;

    public EmployeeEventsConsumer(LeaveBalanceRepository repo) {
        this.repo = repo;
    }

    @KafkaListener(topics = "workhub.employee.events.v1", groupId = "leave-service")
    public void onEmployeeCreated(EmployeeCreatedEvent event) {
        int year = LocalDate.now().getYear();

        repo.findByEmployeeIdAndYear(event.employeeId(), year).ifPresentOrElse(
                existing -> {},
                () -> repo.save(LeaveBalance.builder()
                        .id(UUID.randomUUID())
                        .employeeId(event.employeeId())
                        .year(year)
                        .totalDays(BigDecimal.valueOf(22))
                        .usedDays(BigDecimal.ZERO)
                        .pendingDays(BigDecimal.ZERO)
                        .carriedOverDays(BigDecimal.ZERO)
                        .remainingDays(BigDecimal.valueOf(22))
                        .updatedAt(Instant.now())
                        .build())
        );
    }
}