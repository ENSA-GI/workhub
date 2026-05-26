package com.workhub.payroll.dto;

import java.math.BigDecimal;
import java.util.List;

public class PayrollAnalyticsDTOs {

    // Pour la carte YTD (Year-To-Date)
    public record YtdSummaryDTO(
            BigDecimal totalGrossYtd,
            BigDecimal totalNetYtd,
            BigDecimal totalSocialChargesYtd,
            BigDecimal averageCostPerEmployee
    ) {}

    // Pour le graphique d'évolution mensuelle (LineChart)
    public record MonthlyTrendDTO(
            String month,
            BigDecimal gross,
            BigDecimal net,
            BigDecimal socialCharges
    ) {}

    // Pour le camembert des charges (PieChart)
    public record ChargesDistributionDTO(
            BigDecimal totalCnss,
            BigDecimal totalAmo,
            BigDecimal totalIr
    ) {}
}