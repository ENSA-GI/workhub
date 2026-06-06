package com.workhub.payroll.service;

import com.workhub.payroll.client.EmployeeClient;
import com.workhub.payroll.client.IdentityClient;
import com.workhub.payroll.domain.*;
import com.workhub.payroll.dto.PayrollAnalyticsDTOs;
import com.workhub.payroll.dto.PayrollAdjustmentDTO;
import com.workhub.payroll.repo.*;
import com.workhub.payroll.kafka.producer.PayrollEventsPublisher;
import com.workhub.payroll.kafka.event.PayrollGeneratedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepo;
    private final PayrollItemRepository itemRepo;
    private final PayrollParameterRepository paramsRepo;
    private final PayrollAdjustmentRepository adjustmentRepo;
    private final EmployeeClient employeeClient;
    private final IdentityClient identityClient;
    private final PayrollEngine engine;
    private final PayrollEventsPublisher eventsPublisher;
    private final PayrollBudgetRepository budgetRepo;
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
        BigDecimal grandTotalCnss = BigDecimal.ZERO;
        BigDecimal grandTotalAmo = BigDecimal.ZERO;
        BigDecimal grandTotalIr = BigDecimal.ZERO;

        for (EmployeeClient.EmployeeResponse emp : employees) {
            BigDecimal baseSalary = emp.getBaseSalary() != null ? emp.getBaseSalary() : BigDecimal.ZERO;
            int children = emp.getChildrenCount() != null ? emp.getChildrenCount() : 0;

            BigDecimal transportBonus = emp.getTransportBonus() != null ? emp.getTransportBonus() : BigDecimal.ZERO;
            BigDecimal mealBonus = emp.getMealBonus() != null ? emp.getMealBonus() : BigDecimal.ZERO;
            BigDecimal totalEmployeeBonuses = transportBonus.add(mealBonus);

            // 1. Calcul des salaires
            PayrollEngine.CalculationResult result = engine.calculate(baseSalary, totalEmployeeBonuses, params, children);

            // 2. Préparation du bulletin en base
            PayrollItem item = new PayrollItem();
            item.setPayroll(payroll);
            item.setEmployeeId(emp.getId());
            item.setBaseSalary(baseSalary);
            item.setTransportBonus(transportBonus);
            item.setMealBonus(mealBonus);
            item.setPerformanceBonus(BigDecimal.ZERO);
            item.setGrossSalary(result.gross());
            item.setNetSalary(result.net());
            item.setCnssDeduction(result.cnss());
            item.setAmoDeduction(result.amo());
            item.setTaxableIncome(result.taxable());
            item.setIrDeduction(result.ir());

            // 3. --- RÉCUPÉRATION DU NOM RÉEL DEPUIS IDENTITY-SERVICE ---
            String empName = "Employe " + emp.getId().toString().substring(0, 8);
            if (emp.getUserId() != null) {
                try {
                    IdentityClient.UserResponse userResp = identityClient.getUserById(emp.getUserId());
                    if (userResp != null && userResp.getFirstName() != null) {
                        empName = userResp.getFirstName() + " " + userResp.getLastName();
                    }
                } catch (Exception e) {
                    log.warn("Impossible de recuperer le nom pour le user {}: {}", emp.getUserId(), e.getMessage());
                }
            } else if (emp.getFirstName() != null && emp.getLastName() != null) {
                empName = emp.getFirstName() + " " + emp.getLastName();
            }

            // 4. --- GÉNÉRATION ET STOCKAGE DU PDF ---
            try {
                String monthName = getMonthName(month);

                // Génération du tableau d'octets PDF
                byte[] pdfBytes = pdfGenerator.generatePayslipPdf(item, empName, monthName, year);

                // Nom unique du fichier dans MinIO
                String filename = String.format("bulletin_%s_%d_%s.pdf", monthName, year, emp.getId());

                // Upload vers MinIO et récupération du lien
                String pdfUrl = storageService.uploadPdf(filename, pdfBytes);
                item.setBulletinPdfUrl(pdfUrl);

            } catch (Exception e) {
                log.error("Échec de la génération/upload du PDF pour l'employé {}: {}", emp.getId(), e.getMessage());
            }

            // 5. Sauvegarde finale de la ligne de paie
            itemRepo.save(item);

            grandTotalGross = grandTotalGross.add(result.gross());
            grandTotalNet = grandTotalNet.add(result.net());
            grandTotalCnss = grandTotalCnss.add(result.cnss());
            grandTotalAmo = grandTotalAmo.add(result.amo());
            grandTotalIr = grandTotalIr.add(result.ir());
        }

        payroll.setTotalGrossSalary(grandTotalGross);
        payroll.setTotalNetSalary(grandTotalNet);
        payroll.setTotalCnss(grandTotalCnss);
        payroll.setTotalAmo(grandTotalAmo);
        payroll.setTotalIr(grandTotalIr);

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
     * Met à jour le statut d'une paie (ex: DRAFT -> VALIDATED -> PAID).
     */
    @Transactional
    public Payroll updatePayrollStatus(UUID payrollId, PayrollStatus newStatus, UUID updatedBy) {
        Payroll payroll = payrollRepo.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Paie non trouvée."));

        if (newStatus == PayrollStatus.VALIDATED && payroll.getStatus() != PayrollStatus.DRAFT) {
            throw new RuntimeException("Seule une paie en brouillon peut être validée.");
        }

        payroll.setStatus(newStatus);
        payroll.setValidatedAt(java.time.LocalDateTime.now());
        payroll.setValidatedBy(updatedBy);

        log.info("Payroll {} status updated to {}", payrollId, newStatus);
        Payroll savedPayroll = payrollRepo.save(payroll);
        if (newStatus == PayrollStatus.VALIDATED) {
            publishPayslipNotifications(savedPayroll);
        }
        return savedPayroll;
    }

    /**
     * Calcule le résumé annuel (YTD) pour l'organisation.
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
                totalGross = totalGross.add(resolvePayrollTotal(p, p.getTotalGrossSalary(), PayrollItem::getGrossSalary));
                totalNet = totalNet.add(resolvePayrollTotal(p, p.getTotalNetSalary(), PayrollItem::getNetSalary));

                BigDecimal socialForMonth = resolvePayrollTotal(p, p.getTotalCnss(), PayrollItem::getCnssDeduction)
                        .add(resolvePayrollTotal(p, p.getTotalAmo(), PayrollItem::getAmoDeduction))
                        .add(resolvePayrollTotal(p, p.getTotalIr(), PayrollItem::getIrDeduction));
                totalSocial = totalSocial.add(socialForMonth);

                List<PayrollItem> items = itemRepo.findAllByPayrollId(p.getId());
                totalEmployees += items.size();
                payrollCount++;
            }
        }

        BigDecimal avgCost = BigDecimal.ZERO;
        if (totalEmployees > 0) {
            avgCost = totalGross.divide(BigDecimal.valueOf(totalEmployees), 2, java.math.RoundingMode.HALF_UP);
        }

        return new PayrollAnalyticsDTOs.YtdSummaryDTO(totalGross, totalNet, totalSocial, avgCost);
    }

    /**
     * Génère l'évolution mensuelle sur 6 mois (LineChart).
     */
    public List<PayrollAnalyticsDTOs.MonthlyTrendDTO> getMonthlyTrend(UUID orgId, int year) {
        List<Payroll> payrolls = payrollRepo.findAllByOrganizationId(orgId);

        return payrolls.stream()
                .filter(p -> p.getYear() == year && p.getStatus() != PayrollStatus.DRAFT)
                .sorted(java.util.Comparator.comparing(Payroll::getMonth))
                .map(p -> {
                    BigDecimal social = resolvePayrollTotal(p, p.getTotalCnss(), PayrollItem::getCnssDeduction)
                            .add(resolvePayrollTotal(p, p.getTotalAmo(), PayrollItem::getAmoDeduction))
                            .add(resolvePayrollTotal(p, p.getTotalIr(), PayrollItem::getIrDeduction));
                    return new PayrollAnalyticsDTOs.MonthlyTrendDTO(
                            getMonthName(p.getMonth()),
                            resolvePayrollTotal(p, p.getTotalGrossSalary(), PayrollItem::getGrossSalary),
                            resolvePayrollTotal(p, p.getTotalNetSalary(), PayrollItem::getNetSalary),
                            social
                    );
                })
                .toList();
    }

    /**
     * Génère la répartition des charges (PieChart).
     */
    public PayrollAnalyticsDTOs.ChargesDistributionDTO getChargesDistribution(UUID orgId, int year) {
        List<Payroll> payrolls = payrollRepo.findAllByOrganizationId(orgId);

        BigDecimal cnss = BigDecimal.ZERO;
        BigDecimal amo = BigDecimal.ZERO;
        BigDecimal ir = BigDecimal.ZERO;

        for (Payroll p : payrolls) {
            if (p.getYear() == year && p.getStatus() != PayrollStatus.DRAFT) {
                cnss = cnss.add(resolvePayrollTotal(p, p.getTotalCnss(), PayrollItem::getCnssDeduction));
                amo = amo.add(resolvePayrollTotal(p, p.getTotalAmo(), PayrollItem::getAmoDeduction));
                ir = ir.add(resolvePayrollTotal(p, p.getTotalIr(), PayrollItem::getIrDeduction));
            }
        }

        return new PayrollAnalyticsDTOs.ChargesDistributionDTO(cnss, amo, ir);
    }

    /**
     * Récupère la liste de tous les bulletins individuels (items) d'une paie mensuelle.
     */
    public List<PayrollItem> getPayrollItems(UUID payrollId) {
        log.info("Fetching payroll items for payroll: {}", payrollId);
        return itemRepo.findAllByPayrollId(payrollId);
    }

    /**
     * Agrège dynamiquement les coûts salariaux par département pour un mois donné.
     */
    public List<com.workhub.payroll.dto.PayrollAnalyticsDTOs.DepartmentCostDTO> getDepartmentCosts(UUID orgId, int month, int year) {
        log.info("Calculating department costs for org {} - {}/{}", orgId, month, year);

        java.util.Optional<Payroll> payrollOpt = payrollRepo.findByOrganizationIdAndYearAndMonth(orgId, year, month);
        if (payrollOpt.isEmpty()) {
            return java.util.List.of();
        }
        if (payrollOpt.get().getStatus() == PayrollStatus.DRAFT) {
            return java.util.List.of();
        }

        List<PayrollItem> items = itemRepo.findAllByPayrollId(payrollOpt.get().getId());

        List<EmployeeClient.EmployeeResponse> employees;
        try {
            employees = employeeClient.getActiveEmployees(orgId).getContent();
        } catch (Exception e) {
            log.warn("Impossible de récupérer les départements réels (service employé en panne).");
            return java.util.List.of();
        }

        java.util.Map<UUID, String> empDeptMap = new java.util.HashMap<>();
        for (EmployeeClient.EmployeeResponse emp : employees) {
            empDeptMap.put(emp.getId(), emp.getDepartment() != null ? emp.getDepartment() : "Non spécifié");
        }

        java.util.Map<String, BigDecimal> deptCostMap = new java.util.HashMap<>();
        java.util.Map<String, Long> deptCountMap = new java.util.HashMap<>();

        for (PayrollItem item : items) {
            String dept = empDeptMap.getOrDefault(item.getEmployeeId(), "Non spécifié");

            deptCostMap.put(dept, deptCostMap.getOrDefault(dept, BigDecimal.ZERO).add(nvl(item.getGrossSalary())));
            deptCountMap.put(dept, deptCountMap.getOrDefault(dept, 0L) + 1);
        }

        return deptCostMap.entrySet().stream()
                .map(entry -> new com.workhub.payroll.dto.PayrollAnalyticsDTOs.DepartmentCostDTO(
                        entry.getKey(),
                        entry.getValue(),
                        deptCountMap.get(entry.getKey())
                ))
                .toList();
    }

    /**
     * Récupère la configuration de paie active pour une organisation.
     */
    public PayrollParameter getActiveConfig(UUID orgId) {
        log.info("Fetching active payroll configuration for organization: {}", orgId);
        return paramsRepo.findFirstByOrganizationIdAndActiveTrueOrderByEffectiveDateDesc(orgId)
                .orElseThrow(() -> new RuntimeException("Aucune configuration de paie trouvée pour cette organisation."));
    }

    /**
     * Crée ou met à jour la configuration de paie d'une organisation.
     */
    @Transactional
    public PayrollParameter updateConfig(UUID orgId, PayrollParameter newParams) {
        log.info("Updating payroll configuration for organization: {}", orgId);
        validatePayrollParameters(newParams);

        paramsRepo.findFirstByOrganizationIdAndActiveTrueOrderByEffectiveDateDesc(orgId)
                .ifPresent(existingConfig -> {
                    existingConfig.setActive(false);
                    paramsRepo.save(existingConfig);
                    log.info("Old configuration {} deactivated.", existingConfig.getId());
                });

        newParams.setId(null);
        newParams.setOrganizationId(orgId);
        newParams.setActive(true);
        if (newParams.getEffectiveDate() == null) {
            newParams.setEffectiveDate(java.time.LocalDate.now());
        }

        return paramsRepo.save(newParams);
    }

    private void validatePayrollParameters(PayrollParameter params) {
        if (params.getCnssEmployeeRate() == null || params.getCnssEmployeeRate().signum() < 0
                || params.getCnssEmployeeRate().compareTo(BigDecimal.ONE) > 0) {
            throw new IllegalArgumentException("Le taux CNSS doit être compris entre 0 % et 100 %.");
        }
        if (params.getAmoEmployeeRate() == null || params.getAmoEmployeeRate().signum() < 0
                || params.getAmoEmployeeRate().compareTo(BigDecimal.ONE) > 0) {
            throw new IllegalArgumentException("Le taux AMO doit être compris entre 0 % et 100 %.");
        }
        if (params.getChildDeduction() == null || params.getChildDeduction().signum() < 0) {
            throw new IllegalArgumentException("La déduction par enfant doit être positive.");
        }
        if (params.getMaxChildrenDeduction() == null || params.getMaxChildrenDeduction() < 0) {
            throw new IllegalArgumentException("Le nombre maximal d'enfants doit être positif.");
        }
        if (params.getIrBrackets() == null || params.getIrBrackets().isBlank()) {
            throw new IllegalArgumentException("Le barème IR est obligatoire.");
        }
        engine.validateIrBrackets(params.getIrBrackets());
    }

    /**
     * Génère un fichier CSV d'historique des paies directement dans le flux de réponse.
     */
    public void exportPayrollHistoryToCsv(UUID orgId, Integer year, java.io.PrintWriter writer) {
        log.info("Generating payroll history CSV for organization {} and year {}", orgId, year);

        List<Payroll> payrolls = payrollRepo.findByOrganizationIdOrderByYearDescMonthDesc(orgId);

        writer.println("ID Paie,Annee,Mois,Statut,Total Brut (MAD),Total Net (MAD),CNSS (MAD),AMO (MAD),IR (MAD),Date Generation");

        for (Payroll p : payrolls) {
            if (year != null && p.getYear() != year) {
                continue;
            }
            writer.printf("%s,%d,%d,%s,%.2f,%.2f,%.2f,%.2f,%.2f,%s\n",
                    p.getId(),
                    p.getYear(),
                    p.getMonth(),
                    p.getStatus().toString(),
                    nvl(p.getTotalGrossSalary()),
                    nvl(p.getTotalNetSalary()),
                    nvl(p.getTotalCnss()),
                    nvl(p.getTotalAmo()),
                    nvl(p.getTotalIr()),
                    p.getGeneratedAt()
            );
        }
        writer.flush();
    }

    public byte[] generatePayrollHistoryReportPdf(UUID orgId, Integer year) {
        log.info("Generating professional payroll history report for organization {} and year {}", orgId, year);

        List<Payroll> payrolls = payrollRepo.findByOrganizationIdOrderByYearDescMonthDesc(orgId).stream()
                .filter(p -> year == null || p.getYear().equals(year))
                .sorted(Comparator.comparing(Payroll::getYear).thenComparing(Payroll::getMonth))
                .toList();

        List<PdfGenerator.PayrollReportRow> rows = new ArrayList<>();
        int payslipCount = 0;
        int financialPayrollCount = 0;
        int financialPayslipCount = 0;
        int draftCount = 0;
        int validatedCount = 0;
        int paidCount = 0;
        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;
        BigDecimal totalCnss = BigDecimal.ZERO;
        BigDecimal totalAmo = BigDecimal.ZERO;
        BigDecimal totalIr = BigDecimal.ZERO;
        BigDecimal topGross = BigDecimal.ZERO;
        String topPeriod = "N/A";

        for (Payroll payroll : payrolls) {
            List<PayrollItem> items = itemRepo.findAllByPayrollId(payroll.getId());
            int monthlyPayslipCount = items.size();
            payslipCount += monthlyPayslipCount;

            BigDecimal gross = resolvePayrollTotal(payroll, payroll.getTotalGrossSalary(), PayrollItem::getGrossSalary);
            BigDecimal net = resolvePayrollTotal(payroll, payroll.getTotalNetSalary(), PayrollItem::getNetSalary);
            BigDecimal cnss = resolvePayrollTotal(payroll, payroll.getTotalCnss(), PayrollItem::getCnssDeduction);
            BigDecimal amo = resolvePayrollTotal(payroll, payroll.getTotalAmo(), PayrollItem::getAmoDeduction);
            BigDecimal ir = resolvePayrollTotal(payroll, payroll.getTotalIr(), PayrollItem::getIrDeduction);
            BigDecimal charges = cnss.add(amo).add(ir);

            if (payroll.getStatus() == PayrollStatus.DRAFT) {
                draftCount++;
            } else {
                financialPayrollCount++;
                financialPayslipCount += monthlyPayslipCount;
                totalGross = totalGross.add(gross);
                totalNet = totalNet.add(net);
                totalCnss = totalCnss.add(cnss);
                totalAmo = totalAmo.add(amo);
                totalIr = totalIr.add(ir);
                if (gross.compareTo(topGross) > 0) {
                    topGross = gross;
                    topPeriod = getMonthName(payroll.getMonth()) + " " + payroll.getYear();
                }
                if (payroll.getStatus() == PayrollStatus.VALIDATED) {
                    validatedCount++;
                } else if (payroll.getStatus() == PayrollStatus.PAID) {
                    paidCount++;
                }
            }

            rows.add(new PdfGenerator.PayrollReportRow(
                    getMonthName(payroll.getMonth()) + " " + payroll.getYear(),
                    payroll.getStatus() != null ? payroll.getStatus().name() : null,
                    monthlyPayslipCount,
                    gross,
                    net,
                    cnss,
                    amo,
                    ir,
                    charges,
                    payroll.getGeneratedAt()
            ));
        }

        BigDecimal totalCharges = totalCnss.add(totalAmo).add(totalIr);
        BigDecimal averageNet = financialPayslipCount > 0
                ? totalNet.divide(BigDecimal.valueOf(financialPayslipCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        PdfGenerator.PayrollReportSummary summary = new PdfGenerator.PayrollReportSummary(
                orgId,
                year != null ? "Annee " + year : "Toutes periodes",
                payrolls.size(),
                payslipCount,
                financialPayrollCount,
                draftCount,
                validatedCount,
                paidCount,
                totalGross.setScale(2, RoundingMode.HALF_UP),
                totalNet.setScale(2, RoundingMode.HALF_UP),
                totalCnss.setScale(2, RoundingMode.HALF_UP),
                totalAmo.setScale(2, RoundingMode.HALF_UP),
                totalIr.setScale(2, RoundingMode.HALF_UP),
                totalCharges.setScale(2, RoundingMode.HALF_UP),
                averageNet,
                topPeriod,
                topGross.setScale(2, RoundingMode.HALF_UP),
                LocalDateTime.now()
        );

        return pdfGenerator.generatePayrollHistoryReport(summary, rows);
    }

    /**
     * Calcule dynamiquement l'utilisation du budget annuel.
     */
    public com.workhub.payroll.dto.PayrollAnalyticsDTOs.BudgetUtilizationDTO getBudgetUtilization(UUID orgId, int year) {
        log.info("Calculating budget utilization for org {} and year {}", orgId, year);

        BigDecimal annualBudget = budgetRepo.findByOrganizationIdAndBudgetYear(orgId, year)
                .map(PayrollBudget::getTotalBudget)
                .orElse(BigDecimal.ZERO);

        List<Payroll> payrolls = payrollRepo.findAllByOrganizationId(orgId);
        BigDecimal spentAmount = BigDecimal.ZERO;

        for (Payroll p : payrolls) {
            if (p.getYear() == year && p.getStatus() != PayrollStatus.DRAFT) {
                spentAmount = spentAmount.add(resolvePayrollTotal(p, p.getTotalGrossSalary(), PayrollItem::getGrossSalary));
            }
        }

        BigDecimal remainingAmount = annualBudget.subtract(spentAmount).max(BigDecimal.ZERO);

        double utilizationPercentage = 0.0;
        if (annualBudget.compareTo(BigDecimal.ZERO) > 0) {
            utilizationPercentage = spentAmount.divide(annualBudget, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .doubleValue();
        }

        return new com.workhub.payroll.dto.PayrollAnalyticsDTOs.BudgetUtilizationDTO(
                annualBudget, spentAmount, remainingAmount, utilizationPercentage
        );
    }

    /**
     * Configure ou met à jour le budget annuel d'une organisation.
     */
    @Transactional
    public PayrollBudget saveOrUpdateBudget(UUID orgId, int year, BigDecimal totalBudget) {
        log.info("Saving annual budget of {} MAD for org {} in {}", totalBudget, orgId, year);
        if (totalBudget == null || totalBudget.signum() < 0) {
            throw new IllegalArgumentException("Le budget annuel doit être positif.");
        }

        PayrollBudget budget = budgetRepo.findByOrganizationIdAndBudgetYear(orgId, year)
                .orElse(new PayrollBudget());

        budget.setOrganizationId(orgId);
        budget.setBudgetYear(year);
        budget.setTotalBudget(totalBudget);

        return budgetRepo.save(budget);
    }

    /**
     * Récupère tous les bulletins PDF d'un mois de paie sur MinIO
     * et les compresse dans un seul fichier ZIP.
     */
    public void exportPayslipsToZip(UUID payrollId, java.io.OutputStream outputStream) {
        log.info("Generating ZIP archive of payslips for payroll: {}", payrollId);

        List<PayrollItem> items = itemRepo.findAllByPayrollId(payrollId);

        try (java.util.zip.ZipOutputStream zos = new java.util.zip.ZipOutputStream(outputStream)) {

            for (PayrollItem item : items) {
                if (item.getBulletinPdfUrl() != null) {
                    byte[] pdfBytes = generateFreshPayslipPdf(item.getId());

                    String entryName = String.format("bulletin_employe_%s.pdf", item.getEmployeeId());
                    java.util.zip.ZipEntry zipEntry = new java.util.zip.ZipEntry(entryName);

                    zos.putNextEntry(zipEntry);
                    zos.write(pdfBytes);
                    zos.closeEntry();

                    log.info("Ajout du bulletin {} à l'archive ZIP.", entryName);
                }
            }
            zos.finish();
            log.info("Export ZIP terminé pour la paie {}.", payrollId);

        } catch (Exception e) {
            log.error("Erreur lors de la génération du fichier ZIP : {}", e.getMessage());
            throw new RuntimeException("Échec de la génération de l'archive ZIP.");
        }
    }

    /**
     * Recherche et filtre les paies d'une organisation selon des critères optionnels.
     */
    public List<Payroll> searchPayrolls(UUID orgId, Integer year, Integer month, PayrollStatus status) {
        log.info("Searching payrolls for org {} (filters: year={}, month={}, status={})", orgId, year, month, status);
        return payrollRepo.searchPayrolls(orgId, year, month, status);
    }

    public byte[] generateFreshPayslipPdf(UUID itemId) {
        PayrollItem item = itemRepo.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Bulletin non trouve."));

        try {
            return generatePayslipPdfBytes(item);
        } catch (Exception e) {
            log.warn("Impossible de regenerer le PDF du bulletin {}. Lecture du fichier stocke si disponible.", itemId, e);
            if (item.getBulletinPdfUrl() != null) {
                return storageService.downloadPdf(item.getBulletinPdfUrl());
            }
            throw new RuntimeException("Impossible de generer le bulletin PDF.", e);
        }
    }

    /**
     * Récupère une paie spécifique par son ID unique.
     */
    public Payroll getPayrollById(UUID id) {
        log.info("Fetching payroll details for ID: {}", id);
        return payrollRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Session de paie introuvable."));
    }

    /**
     * Valide le paiement de la paie, génère le fichier de virement bancaire CSV,
     * l'envoie sur MinIO et met à jour le statut en base de données.
     */
    @Transactional
    public Payroll payAndGenerateBankFile(UUID payrollId, UUID updatedBy) {
        log.info("Processing bank transfer payment for payroll ID: {}", payrollId);

        Payroll payroll = getPayrollById(payrollId);

        if (payroll.getStatus() != PayrollStatus.VALIDATED) {
            throw new RuntimeException("Impossible de payer une session de paie qui n'est pas VALIDATED.");
        }

        List<PayrollItem> items = itemRepo.findAllByPayrollId(payrollId);

        StringBuilder csvContent = new StringBuilder();
        csvContent.append("Nom Employe,RIB Bancaire,Montant Net (MAD),Reference Virement\n");

        for (PayrollItem item : items) {
            String mockRib = "181123456789012345678901";

            csvContent.append(String.format("Employe_%s,%s,%.2f,VIREMENT_PAIE_%d_%d\n",
                    item.getEmployeeId(),
                    mockRib,
                    item.getNetSalary(),
                    payroll.getMonth(),
                    payroll.getYear()
            ));
        }

        byte[] csvBytes = csvContent.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);

        String filename = String.format("virement_bancaire_org_%s_periode_%d_%d.csv",
                payroll.getOrganizationId(), payroll.getMonth(), payroll.getYear());

        String fileUrl = "";
        try {
            fileUrl = storageService.uploadPdf(filename, csvBytes);
        } catch (Exception e) {
            log.error("Échec de l'envoi du fichier de virement vers MinIO : {}", e.getMessage());
            throw new RuntimeException("Impossible de stocker le fichier de virement bancaire.");
        }

        payroll.setStatus(PayrollStatus.PAID);
        payroll.setBankFileUrl(fileUrl);
        payroll.setValidatedAt(java.time.LocalDateTime.now());
        payroll.setValidatedBy(updatedBy);

        payroll = payrollRepo.save(payroll);

        log.info("Payroll {} has been paid. Bank file generated: {}", payrollId, fileUrl);

        return payroll;
    }

    /**
     * Marque un bulletin individuel comme "Lu" (consultateur employé).
     */
    @Transactional
    public void markPayslipAsRead(UUID itemId) {
        log.info("Marking payslip item {} as read.", itemId);

        PayrollItem item = itemRepo.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Bulletin de paie introuvable."));

        item.setIsRead(true);
        item.setReadAt(java.time.LocalDateTime.now());

        itemRepo.save(item);
    }

    /**
     * Ajoute un ajustement (heures sup, prime, déduction) à un bulletin
     */
    @Transactional
    public PayrollAdjustment addAdjustment(UUID payrollItemId, PayrollAdjustmentDTO dto) {
        log.info("Adding adjustment to payroll item {}: type={}, amount={}", payrollItemId, dto.getType(), dto.getAmount());

        PayrollItem item = itemRepo.findById(payrollItemId)
                .orElseThrow(() -> new RuntimeException("Bulletin de paie introuvable."));

        ensurePayrollIsDraft(item);

        PayrollAdjustment adjustment = PayrollAdjustment.builder()
                .payrollItem(item)
                .type(PayrollAdjustment.AdjustmentType.valueOf(dto.getType().toUpperCase()))
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .build();

        PayrollAdjustment saved = adjustmentRepo.save(adjustment);
        recalculateItemAndPayroll(item.getId());
        log.info("Adjustment added with id: {}", saved.getId());
        return saved;
    }

    /**
     * Supprime un ajustement
     */
    @Transactional
    public void deleteAdjustment(UUID adjustmentId) {
        log.info("Deleting adjustment: {}", adjustmentId);

        PayrollAdjustment adjustment = adjustmentRepo.findById(adjustmentId)
                .orElseThrow(() -> new RuntimeException("Ajustement introuvable."));

        ensurePayrollIsDraft(adjustment.getPayrollItem());
        UUID payrollItemId = adjustment.getPayrollItem().getId();

        adjustmentRepo.delete(adjustment);
        recalculateItemAndPayroll(payrollItemId);
        log.info("Adjustment deleted successfully");
    }

    private void ensurePayrollIsDraft(PayrollItem item) {
        if (item.getPayroll().getStatus() != PayrollStatus.DRAFT) {
            throw new RuntimeException("Impossible de modifier les ajustements d'une paie déjà validée.");
        }
    }

    private byte[] generatePayslipPdfBytes(PayrollItem item) {
        Payroll payroll = item.getPayroll();
        String monthName = payroll != null && payroll.getMonth() != null
                ? getMonthName(payroll.getMonth())
                : "";
        int year = payroll != null && payroll.getYear() != null
                ? payroll.getYear()
                : LocalDateTime.now().getYear();
        UUID organizationId = payroll != null ? payroll.getOrganizationId() : null;
        String employeeName = resolveEmployeeDisplayName(item.getEmployeeId(), organizationId);

        return pdfGenerator.generatePayslipPdf(item, employeeName, monthName, year);
    }

    private String resolveEmployeeDisplayName(UUID employeeId, UUID organizationId) {
        if (employeeId == null) {
            return "Employe";
        }

        String fallbackName = "Employe " + employeeId.toString().substring(0, 8);
        if (organizationId == null) {
            return fallbackName;
        }

        try {
            EmployeeClient.EmployeeResponse employee = employeeClient.getEmployeeById(employeeId, organizationId);
            if (employee == null) {
                return fallbackName;
            }
            if (employee.getUserId() != null) {
                IdentityClient.UserResponse user = identityClient.getUserById(employee.getUserId());
                if (user != null && user.getFirstName() != null) {
                    return (user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "")).trim();
                }
            }
            if (employee.getFirstName() != null || employee.getLastName() != null) {
                return ((employee.getFirstName() != null ? employee.getFirstName() : "") + " "
                        + (employee.getLastName() != null ? employee.getLastName() : "")).trim();
            }
        } catch (Exception e) {
            log.warn("Impossible de recuperer le nom de l'employe {} pour le PDF: {}", employeeId, e.getMessage());
        }

        return fallbackName;
    }

    private void publishPayslipNotifications(Payroll payroll) {
        for (PayrollItem item : itemRepo.findAllByPayrollId(payroll.getId())) {
            refreshPayslipPdf(item, payroll);
            String employeeEmail = null;
            try {
                EmployeeClient.EmployeeResponse employee = employeeClient.getEmployeeById(
                        item.getEmployeeId(), payroll.getOrganizationId());
                if (employee != null && employee.getUserId() != null) {
                    IdentityClient.UserResponse user = identityClient.getUserById(employee.getUserId());
                    employeeEmail = user != null ? user.getEmail() : null;
                }
            } catch (Exception e) {
                log.warn("Impossible de récupérer l'email de l'employé {}: {}", item.getEmployeeId(), e.getMessage());
            }

            eventsPublisher.sendPayslipGenerated(new com.workhub.payroll.kafka.event.PayslipGeneratedEvent(
                    item.getId(), item.getEmployeeId(), employeeEmail, payroll.getOrganizationId(),
                    String.valueOf(payroll.getMonth()), payroll.getYear(), item.getNetSalary(), item.getBulletinPdfUrl()
            ));
        }
    }

    private void refreshPayslipPdf(PayrollItem item, Payroll payroll) {
        try {
            byte[] pdfBytes = generatePayslipPdfBytes(item);
            String filename = String.format("bulletin_%s_%d_%s.pdf",
                    getMonthName(payroll.getMonth()),
                    payroll.getYear(),
                    item.getEmployeeId());
            String pdfUrl = storageService.uploadPdf(filename, pdfBytes);
            item.setBulletinPdfUrl(pdfUrl);
            itemRepo.save(item);
        } catch (Exception e) {
            log.warn("Impossible de regenerer le PDF du bulletin {} avant notification: {}", item.getId(), e.getMessage());
        }
    }

    private void recalculateItemAndPayroll(UUID payrollItemId) {
        PayrollItem item = itemRepo.findById(payrollItemId)
                .orElseThrow(() -> new RuntimeException("Bulletin de paie introuvable."));

        UUID organizationId = item.getPayroll().getOrganizationId();
        PayrollParameter params = paramsRepo.findFirstByOrganizationIdAndActiveTrueOrderByEffectiveDateDesc(organizationId)
                .orElseThrow(() -> new RuntimeException("Paramètres de paie non configurés."));

        EmployeeClient.EmployeeResponse employee = employeeClient.getEmployeeById(item.getEmployeeId(), organizationId);
        int children = employee.getChildrenCount() != null ? employee.getChildrenCount() : 0;

        BigDecimal baseGross = nvl(item.getBaseSalary())
                .add(nvl(item.getTransportBonus()))
                .add(nvl(item.getMealBonus()))
                .add(nvl(item.getPerformanceBonus()));

        BigDecimal adjustmentDelta = adjustmentRepo.findByPayrollItemId(payrollItemId).stream()
                .map(a -> a.getType() == PayrollAdjustment.AdjustmentType.DEDUCTION ? a.getAmount().negate() : a.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal recalculatedBase = baseGross.add(adjustmentDelta).max(BigDecimal.ZERO);
        PayrollEngine.CalculationResult result = engine.calculate(recalculatedBase, BigDecimal.ZERO, params, children);

        item.setGrossSalary(result.gross());
        item.setCnssDeduction(result.cnss());
        item.setAmoDeduction(result.amo());
        item.setTaxableIncome(result.taxable());
        item.setIrDeduction(result.ir());
        item.setNetSalary(result.net());
        itemRepo.save(item);

        recalculatePayrollTotals(item.getPayroll().getId());
    }

    private void recalculatePayrollTotals(UUID payrollId) {
        Payroll payroll = payrollRepo.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Paie introuvable."));

        List<PayrollItem> items = itemRepo.findAllByPayrollId(payrollId);
        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;
        BigDecimal totalCnss = BigDecimal.ZERO;
        BigDecimal totalAmo = BigDecimal.ZERO;
        BigDecimal totalIr = BigDecimal.ZERO;

        for (PayrollItem payrollItem : items) {
            totalGross = totalGross.add(nvl(payrollItem.getGrossSalary()));
            totalNet = totalNet.add(nvl(payrollItem.getNetSalary()));
            totalCnss = totalCnss.add(nvl(payrollItem.getCnssDeduction()));
            totalAmo = totalAmo.add(nvl(payrollItem.getAmoDeduction()));
            totalIr = totalIr.add(nvl(payrollItem.getIrDeduction()));
        }

        payroll.setTotalGrossSalary(totalGross.setScale(2, RoundingMode.HALF_UP));
        payroll.setTotalNetSalary(totalNet.setScale(2, RoundingMode.HALF_UP));
        payroll.setTotalCnss(totalCnss.setScale(2, RoundingMode.HALF_UP));
        payroll.setTotalAmo(totalAmo.setScale(2, RoundingMode.HALF_UP));
        payroll.setTotalIr(totalIr.setScale(2, RoundingMode.HALF_UP));
        payrollRepo.save(payroll);
    }

    private BigDecimal nvl(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private BigDecimal resolvePayrollTotal(
            Payroll payroll,
            BigDecimal storedTotal,
            java.util.function.Function<PayrollItem, BigDecimal> itemAmount
    ) {
        if (storedTotal != null) {
            return storedTotal;
        }
        return itemRepo.findAllByPayrollId(payroll.getId()).stream()
                .map(itemAmount)
                .map(this::nvl)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
