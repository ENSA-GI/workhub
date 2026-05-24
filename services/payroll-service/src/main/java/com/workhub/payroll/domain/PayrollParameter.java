package com.workhub.payroll.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "payroll_parameters")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PayrollParameter {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID organizationId;
    private BigDecimal cnssEmployeeRate;
    private BigDecimal amoEmployeeRate;

    @Column(columnDefinition = "jsonb")
    private String irBrackets; // On traitera le JSON plus tard dans le service

    private BigDecimal childDeduction;
    private Integer maxChildrenDeduction;
    private LocalDate effectiveDate;
    private Boolean active;
}