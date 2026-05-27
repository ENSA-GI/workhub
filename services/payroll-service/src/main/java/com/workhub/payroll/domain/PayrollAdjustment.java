package com.workhub.payroll.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payroll_adjustments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollAdjustment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_item_id", nullable = false)
    @JsonIgnore
    private PayrollItem payrollItem;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AdjustmentType type;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    public enum AdjustmentType {
        OVERTIME("Heures Supplémentaires"),
        BONUS("Prime"),
        DEDUCTION("Déduction");

        private final String label;

        AdjustmentType(String label) {
            this.label = label;
        }

        public String getLabel() {
            return label;
        }
    }
}

