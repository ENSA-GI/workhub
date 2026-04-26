package com.workhub.leave.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name="leave_balances", uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id","year"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LeaveBalance {

    @Id
    private UUID id;

    @Column(name="employee_id", nullable=false)
    private UUID employeeId;

    @Column(nullable=false)
    private Integer year;

    @Column(name="total_days")
    private BigDecimal totalDays;

    @Column(name="used_days")
    private BigDecimal usedDays;

    @Column(name="pending_days")
    private BigDecimal pendingDays;

    @Column(name="remaining_days")
    private BigDecimal remainingDays;

    @Column(name="carried_over_days")
    private BigDecimal carriedOverDays;

    @Column(name="updated_at")
    private LocalDateTime updatedAt;
}