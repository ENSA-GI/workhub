package com.workhub.payroll.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "payroll_budgets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PayrollBudget {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "budget_year", nullable = false)
    private Integer budgetYear;

    @Column(name = "total_budget", nullable = false)
    private BigDecimal totalBudget;
}