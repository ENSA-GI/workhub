package com.workhub.payroll.service;

import com.workhub.payroll.domain.IrBracket;
import com.workhub.payroll.domain.PayrollParameter;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PayrollEngine {

    private final ObjectMapper objectMapper;

    /**
     * Calcule le net à partir du brut en suivant la législation marocaine.
     */
    public CalculationResult calculate(BigDecimal baseSalary, BigDecimal bonuses, PayrollParameter params, int children) {

        BigDecimal grossSalary = baseSalary.add(bonuses);

        // 1. Cotisations Sociales
        BigDecimal cnss = grossSalary.multiply(params.getCnssEmployeeRate())
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal amo = grossSalary.multiply(params.getAmoEmployeeRate())
                .setScale(2, RoundingMode.HALF_UP);

        // 2. Salaire Brut Imposable (SBI)
        BigDecimal taxableIncome = grossSalary.subtract(cnss).subtract(amo);

        // 3. Calcul de l'IR (Impôt sur le Revenu) - Logique progressive
        BigDecimal irBeforeDeductions = calculateProgressiveIR(taxableIncome, params.getIrBrackets());

        // 4. Déductions pour charges de famille (360 MAD par enfant)
        int childCount = Math.min(children, params.getMaxChildrenDeduction());
        BigDecimal familyDeduction = params.getChildDeduction().multiply(BigDecimal.valueOf(childCount));

        BigDecimal finalIR = irBeforeDeductions.subtract(familyDeduction).max(BigDecimal.ZERO);

        // 5. Salaire Net
        BigDecimal netSalary = taxableIncome.subtract(finalIR);

        return new CalculationResult(grossSalary, cnss, amo, taxableIncome, finalIR, netSalary);
    }

    private BigDecimal calculateProgressiveIR(BigDecimal taxableIncome, String bracketsJson) {
        try {
            List<IrBracket> brackets = objectMapper.readValue(bracketsJson, new TypeReference<>() {});
            BigDecimal totalTax = BigDecimal.ZERO;

            for (IrBracket bracket : brackets) {
                if (taxableIncome.compareTo(bracket.min()) > 0) {
                    BigDecimal upper = (bracket.max() == null || taxableIncome.compareTo(bracket.max()) < 0)
                            ? taxableIncome : bracket.max();
                    BigDecimal taxableInThisBracket = upper.subtract(bracket.min());
                    totalTax = totalTax.add(taxableInThisBracket.multiply(bracket.rate()));
                }
            }
            return totalTax.setScale(2, RoundingMode.HALF_UP);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du calcul de l'IR : " + e.getMessage());
        }
    }

    // Objet interne pour retourner les résultats
    public record CalculationResult(
            BigDecimal gross, BigDecimal cnss, BigDecimal amo,
            BigDecimal taxable, BigDecimal ir, BigDecimal net
    ) {}
}