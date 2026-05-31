package com.workhub.payroll.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payrolls")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(nullable = false)
    private Integer month;

    @Column(nullable = false)
    private Integer year;

    @Enumerated(EnumType.STRING)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    @Column(name = "status")
    private PayrollStatus status;

    private String bankFileUrl;

    // Précision monétaire professionnelle
    private BigDecimal totalGrossSalary;
    private BigDecimal totalNetSalary;
    private BigDecimal totalCnss;
    private BigDecimal totalAmo;
    private BigDecimal totalIr;

    private LocalDateTime generatedAt;

    @Column(nullable = false)
    private UUID generatedBy;

    private LocalDateTime validatedAt;
    private UUID validatedBy;

    // Méthode d'aide pour initialiser une paie en brouillon
    @PrePersist
    protected void onCreate() {
        if (this.status == null) {
            this.status = PayrollStatus.DRAFT;
        }
        if (this.generatedAt == null) {
            this.generatedAt = LocalDateTime.now();
        }
    }
}