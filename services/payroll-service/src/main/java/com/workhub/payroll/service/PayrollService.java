package com.workhub.payroll.service;

import com.workhub.payroll.client.EmployeeClient;
import com.workhub.payroll.domain.*;
import com.workhub.payroll.dto.PayrollAnalyticsDTOs;
import com.workhub.payroll.repo.*;
import com.workhub.payroll.kafka.producer.PayrollEventsPublisher;
import com.workhub.payroll.kafka.event.PayrollGeneratedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepo;
    private final PayrollItemRepository itemRepo;
    private final PayrollParameterRepository paramsRepo;
    private final EmployeeClient employeeClient;
    private final PayrollEngine engine;
    private final PayrollEventsPublisher eventsPublisher;

    // Injection des deux nouveaux services pour le PDF et MinIO
    private final PdfGenerator pdfGenerator;
    private final StorageService storageService;

    @Transactional
    public Payroll generateMonthlyPayroll(UUID orgId, int month, int year, UUID requestedBy) {
        // Vérifier si la paie existe déjà
        if (payrollRepo.existsByOrganizationIdAndYearAndMonth(orgId, year, month)) {
            throw new RuntimeException("La paie pour cette période existe déjà.");
        }

        // Récupérer les paramètres (Taux CNSS/AMO, Brackets IR)
        PayrollParameter params = paramsRepo.findFirstByOrganizationIdAndActiveTrueOrderByEffectiveDateDesc(orgId)
                .orElseThrow(() -> new RuntimeException("Paramètres de paie non configurés."));

        // Récupérer les employés
        List<EmployeeClient.EmployeeResponse> employees;
        try {
            employees = employeeClient.getActiveEmployees(orgId).getContent();
        } catch (Exception e) {
            log.warn("Le service employé a planté ! Utilisation d'un employé FICTIF pour tester.");
            EmployeeClient.EmployeeResponse fakeEmp = new EmployeeClient.EmployeeResponse();
            fakeEmp.setId(UUID.randomUUID());
            fakeEmp.setFirstName("Faux");
            fakeEmp.setLastName("Employé");
            fakeEmp.setBaseSalary(new BigDecimal("10000.00"));
            fakeEmp.setChildrenCount(2);
            employees = List.of(fakeEmp);
        }

        if (employees == null || employees.isEmpty()) {
            throw new RuntimeException("Aucun employé actif trouvé pour cette organisation.");
        }

        // Initialisation de la paie globale
        Payroll payroll = Payroll.builder()
                .organizationId(orgId)
                .month(month)
                .year(year)
                .status(PayrollStatus.DRAFT)
                .generatedBy(requestedBy)
                .totalGrossSalary(BigDecimal.ZERO)
                .totalNetSalary(BigDecimal.ZERO)
                .build();

        payroll = payrollRepo.save(payroll);

        BigDecimal grandTotalGross = BigDecimal.ZERO;
        BigDecimal grandTotalNet = BigDecimal.ZERO;

        for (EmployeeClient.EmployeeResponse emp : employees) {
            BigDecimal baseSalary = emp.getBaseSalary() != null ? emp.getBaseSalary() : BigDecimal.ZERO;
            int children = emp.getChildrenCount() != null ? emp.getChildrenCount() : 0;

            // 1. Calcul des salaires
            PayrollEngine.CalculationResult result = engine.calculate(baseSalary, BigDecimal.ZERO, params, children);

            // 2. Préparation du bulletin en base
            PayrollItem item = new PayrollItem();
            item.setPayroll(payroll);
            item.setEmployeeId(emp.getId());
            item.setBaseSalary(baseSalary);
            item.setGrossSalary(result.gross());
            item.setNetSalary(result.net());
            item.setCnssDeduction(result.cnss());
            item.setAmoDeduction(result.amo());
            item.setTaxableIncome(result.taxable());
            item.setIrDeduction(result.ir());

            // 3. --- NOUVEAU : GÉNÉRATION ET STOCKAGE DU PDF ---
            try {
                String empName = emp.getFirstName() + " " + emp.getLastName();
                String monthName = getMonthName(month);

                // Génération du tableau d'octets PDF
                byte[] pdfBytes = pdfGenerator.generatePayslipPdf(item, empName, monthName, year);

                // Nom unique du fichier dans MinIO
                String filename = String.format("bulletin_%s_%d_%s.pdf", monthName, year, emp.getId());

                // Upload vers MinIO et récupération du lien
                String pdfUrl = storageService.uploadPdf(filename, pdfBytes);
                item.setBulletinPdfUrl(pdfUrl);

            } catch (Exception e) {
                // Si la génération de PDF échoue, on loggue l'erreur mais on ne bloque pas
                // la sauvegarde de la paie (pour rester robuste en prod)
                log.error("Échec de la génération/upload du PDF pour l'employé {}: {}", emp.getId(), e.getMessage());
            }

            // 4. Sauvegarde finale de la ligne de paie
            itemRepo.save(item);

            grandTotalGross = grandTotalGross.add(result.gross());
            grandTotalNet = grandTotalNet.add(result.net());
        }

        payroll.setTotalGrossSalary(grandTotalGross);
        payroll.setTotalNetSalary(grandTotalNet);

        // Publication de l'événement Kafka
        eventsPublisher.sendPayrollGenerated(new PayrollGeneratedEvent(
                payroll.getId(), orgId, String.valueOf(month), year, grandTotalNet, employees.size(), requestedBy.toString(), payroll.getGeneratedAt()
        ));

        return payrollRepo.save(payroll);
    }

    public List<Payroll> getPayrollsByOrganization(UUID orgId) {
        log.info("Fetching sorted payroll history for organization: {}", orgId);
        return payrollRepo.findByOrganizationIdOrderByYearDescMonthDesc(orgId);
    }

    /**
     * Convertit le numéro de mois en nom français pour le PDF.
     */
    private String getMonthName(int month) {
        String[] months = {"", "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
                "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"};
        if (month >= 1 && month <= 12) {
            return months[month];
        }
        return String.valueOf(month);
    }
    public List<PayrollItem> getEmployeePayslips(UUID employeeId) {
        log.info("Fetching payslips for employee: {}", employeeId);
        return itemRepo.findAllByEmployeeId(employeeId);
    }
    public byte[] getPayslipPdfContent(UUID itemId) {
        PayrollItem item = itemRepo.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Bulletin non trouvé."));

        if (item.getBulletinPdfUrl() == null) {
            throw new RuntimeException("Le fichier PDF n'a pas encore été généré pour ce bulletin.");
        }

        return storageService.downloadPdf(item.getBulletinPdfUrl());
    }
    /**
     * NOUVEAU : Met à jour le statut d'une paie (ex: DRAFT -> VALIDATED -> PAID).
     */
    @Transactional
    public Payroll updatePayrollStatus(UUID payrollId, PayrollStatus newStatus, UUID updatedBy) {
        Payroll payroll = payrollRepo.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Paie non trouvée."));

        payroll.setStatus(newStatus);
        payroll.setValidatedAt(java.time.LocalDateTime.now());
        payroll.setValidatedBy(updatedBy);

        log.info("Payroll {} status updated to {}", payrollId, newStatus);
        return payrollRepo.save(payroll);
    }

    /**
     * NOUVEAU : Calcule le résumé annuel (YTD) pour l'organisation.
     */
    public PayrollAnalyticsDTOs.YtdSummaryDTO getYtdSummary(UUID orgId, int year) {
        List<Payroll> payrolls = payrollRepo.findAllByOrganizationId(orgId);

        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;
        BigDecimal totalSocial = BigDecimal.ZERO;
        int totalEmployees = 0;
        int payrollCount = 0;

        for (Payroll p : payrolls) {
            if (p.getYear() == year && p.getStatus() != PayrollStatus.DRAFT) {
                totalGross = totalGross.add(p.getTotalGrossSalary());
                totalNet = totalNet.add(p.getTotalNetSalary());

                BigDecimal socialForMonth = p.getTotalCnss().add(p.getTotalAmo()).add(p.getTotalIr());
                totalSocial = totalSocial.add(socialForMonth);

                // On récupère le nombre d'employés traités
                List<PayrollItem> items = itemRepo.findAllByPayrollId(p.getId());
                totalEmployees += items.size();
                payrollCount++;
            }
        }

        BigDecimal avgCost = BigDecimal.ZERO;
        if (totalEmployees > 0) {
            // Coût moyen = total brut / nombre total d'employés traités
            avgCost = totalGross.divide(BigDecimal.valueOf(totalEmployees), 2, java.math.RoundingMode.HALF_UP);
        }

        return new PayrollAnalyticsDTOs.YtdSummaryDTO(totalGross, totalNet, totalSocial, avgCost);
    }

    /**
     * NOUVEAU : Génère l'évolution mensuelle sur 6 mois (LineChart).
     */
    public List<PayrollAnalyticsDTOs.MonthlyTrendDTO> getMonthlyTrend(UUID orgId, int year) {
        List<Payroll> payrolls = payrollRepo.findAllByOrganizationId(orgId);

        return payrolls.stream()
                .filter(p -> p.getYear() == year && p.getStatus() != PayrollStatus.DRAFT)
                .map(p -> {
                    BigDecimal social = p.getTotalCnss().add(p.getTotalAmo()).add(p.getTotalIr());
                    return new PayrollAnalyticsDTOs.MonthlyTrendDTO(
                            getMonthName(p.getMonth()),
                            p.getTotalGrossSalary(),
                            p.getTotalNetSalary(),
                            social
                    );
                })
                .toList();
    }

    /**
     * NOUVEAU : Génère la répartition des charges (PieChart).
     */
    public PayrollAnalyticsDTOs.ChargesDistributionDTO getChargesDistribution(UUID orgId, int year) {
        List<Payroll> payrolls = payrollRepo.findAllByOrganizationId(orgId);

        BigDecimal cnss = BigDecimal.ZERO;
        BigDecimal amo = BigDecimal.ZERO;
        BigDecimal ir = BigDecimal.ZERO;

        for (Payroll p : payrolls) {
            if (p.getYear() == year && p.getStatus() != PayrollStatus.DRAFT) {
                cnss = cnss.add(p.getTotalCnss() != null ? p.getTotalCnss() : BigDecimal.ZERO);
                amo = amo.add(p.getTotalAmo() != null ? p.getTotalAmo() : BigDecimal.ZERO);
                ir = ir.add(p.getTotalIr() != null ? p.getTotalIr() : BigDecimal.ZERO);
            }
        }

        return new PayrollAnalyticsDTOs.ChargesDistributionDTO(cnss, amo, ir);
    }
}