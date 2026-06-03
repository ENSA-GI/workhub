package com.workhub.leave.kafka;

import com.workhub.leave.client.OrgPolicyClient;
import com.workhub.leave.domain.LeaveBalance;
import com.workhub.leave.kafka.event.EmployeeCreatedEvent;
import com.workhub.leave.repo.LeaveBalanceRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class EmployeeEventsConsumer {

    private final LeaveBalanceRepository repo;
    private final OrgPolicyClient orgPolicyClient;

    public EmployeeEventsConsumer(LeaveBalanceRepository repo, OrgPolicyClient orgPolicyClient) {
        this.repo = repo;
        this.orgPolicyClient = orgPolicyClient;
    }

    @KafkaListener(
            topics = "workhub.employee.events.v1",
            groupId = "leave-service",
            containerFactory = "employeeCreatedKafkaListenerContainerFactory"
    )
    public void onEmployeeCreated(EmployeeCreatedEvent event) {
        int year = LocalDate.now().getYear();
        UUID orgId = event.organizationId();
        int annualDays = orgId != null ? orgPolicyClient.leaveDaysPerYear(orgId) : 22;
        BigDecimal carried = orgId != null ? orgPolicyClient.maxCarryOver(orgId) : BigDecimal.ZERO;

        repo.findByEmployeeIdAndYear(event.employeeId(), year).ifPresentOrElse(
                existing -> {},
                () -> repo.save(LeaveBalance.builder()
                        .id(UUID.randomUUID())
                        .employeeId(event.employeeId())
                        .year(year)
                        .totalDays(BigDecimal.valueOf(annualDays))
                        .usedDays(BigDecimal.ZERO)
                        .pendingDays(BigDecimal.ZERO)
                        .carriedOverDays(carried)
                        .remainingDays(BigDecimal.valueOf(annualDays).add(carried))
                        .updatedAt(LocalDateTime.now())
                        .build())
        );
    }
}