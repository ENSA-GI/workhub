package com.workhub.payroll.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollAdjustmentDTO {
    @NotNull(message = "Type d'ajustement obligatoire")
    private String type;

    @NotNull(message = "Montant obligatoire")
    private BigDecimal amount;

    private String description;
}

