package com.workhub.payroll.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "payroll_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PayrollItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_id")
    private Payroll payroll;

    private UUID employeeId;
    private BigDecimal baseSalary;
    private BigDecimal transportBonus;
    private BigDecimal mealBonus;
    private BigDecimal performanceBonus;
    private BigDecimal grossSalary;
    private BigDecimal cnssDeduction;
    private BigDecimal amoDeduction;
    private BigDecimal taxableIncome;
    private BigDecimal irDeduction;
    private BigDecimal netSalary;
    private String bulletinPdfUrl;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "read_at")
    private java.time.LocalDateTime readAt;

    @OneToMany(mappedBy = "payrollItem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<PayrollAdjustment> adjustments;
}