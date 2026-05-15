package com.workhub.employee.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "employee_archives")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeeArchive {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "departure_reason", nullable = false)
    private DepartureReason departureReason;

    @Column(name = "departure_date", nullable = false)
    private LocalDate departureDate;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "final_settlement_amount", precision = 12, scale = 2)
    private BigDecimal finalSettlementAmount;

    @Column(name = "archived_by", nullable = false)
    private UUID archivedBy;

    @CreationTimestamp
    @Column(name = "archived_at", updatable = false)
    private LocalDateTime archivedAt;
}