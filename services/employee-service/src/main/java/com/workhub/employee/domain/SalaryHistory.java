package com.workhub.employee.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "salary_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "old_base_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal oldBaseSalary;

    @Column(name = "new_base_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal newBaseSalary;

    @Column(name = "old_transport_bonus", precision = 10, scale = 2)
    private BigDecimal oldTransportBonus;

    @Column(name = "new_transport_bonus", precision = 10, scale = 2)
    private BigDecimal newTransportBonus;

    @Column(name = "old_meal_bonus", precision = 10, scale = 2)
    private BigDecimal oldMealBonus;

    @Column(name = "new_meal_bonus", precision = 10, scale = 2)
    private BigDecimal newMealBonus;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @CreationTimestamp
    @Column(name = "changed_at", updatable = false)
    private LocalDateTime changedAt;

    @Column(name = "changed_by", nullable = false)
    private UUID changedBy;
}