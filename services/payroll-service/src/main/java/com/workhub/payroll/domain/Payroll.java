package com.workhub.payroll.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name="payrolls")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payroll {
    @Id
    private UUID id;

    @Column(name="organization_id", nullable=false)
    private UUID organizationId;

    @Column(nullable=false)
    private Integer month;

    @Column(nullable=false)
    private Integer year;

    @Enumerated(EnumType.STRING)
    private PayrollStatus status;

    @Column(name="generated_by", nullable=false)
    private UUID generatedBy;

    @Column(name="generated_at")
    private Instant generatedAt;

    private BigDecimal totalGrossSalary;
    private BigDecimal totalNetSalary;
    private BigDecimal totalCnss;
    private BigDecimal totalAmo;
    private BigDecimal totalIr;
}