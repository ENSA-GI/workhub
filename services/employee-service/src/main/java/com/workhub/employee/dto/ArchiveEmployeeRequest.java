package com.workhub.employee.dto;

import com.workhub.employee.domain.DepartureReason;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ArchiveEmployeeRequest {

    @NotNull(message = "Raison de départ obligatoire")
    private DepartureReason departureReason;

    @NotNull(message = "Date de départ obligatoire")
    @PastOrPresent(message = "Date de départ ne peut être future")
    private LocalDate departureDate;

    private String comments;
    private BigDecimal finalSettlementAmount;
}