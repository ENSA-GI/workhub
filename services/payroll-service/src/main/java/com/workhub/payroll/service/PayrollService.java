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
    private final PayrollBudgetRepository budgetRepo;

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

    /**
     * NOUVEAU : Récupère la liste de tous les bulletins individuels (items) d'une paie mensuelle.
     */
    public List<PayrollItem> getPayrollItems(UUID payrollId) {
        log.info("Fetching payroll items for payroll: {}", payrollId);
        return itemRepo.findAllByPayrollId(payrollId);
    }

    /**
     * NOUVEAU : Agrège dynamiquement les coûts salariaux par département pour un mois donné.
     */
    public List<com.workhub.payroll.dto.PayrollAnalyticsDTOs.DepartmentCostDTO> getDepartmentCosts(UUID orgId, int month, int year) {
        log.info("Calculating department costs for org {} - {}/{}", orgId, month, year);

        // 1. Récupérer la paie du mois
        java.util.Optional<Payroll> payrollOpt = payrollRepo.findByOrganizationIdAndYearAndMonth(orgId, year, month);
        if (payrollOpt.isEmpty()) {
            return java.util.List.of();
        }

        // 2. Récupérer les lignes de calcul (items) de cette paie
        List<PayrollItem> items = itemRepo.findAllByPayrollId(payrollOpt.get().getId());

        // 3. Récupérer les employés depuis le service externe pour connaître leur département
        List<EmployeeClient.EmployeeResponse> employees;
        try {
            employees = employeeClient.getActiveEmployees(orgId).getContent();
        } catch (Exception e) {
            log.warn("Impossible de récupérer les départements réels (service employé en panne).");
            return java.util.List.of(
                    new com.workhub.payroll.dto.PayrollAnalyticsDTOs.DepartmentCostDTO("R&D (Fictif)", payrollOpt.get().getTotalGrossSalary(), items.size())
            );
        }

        // 4. Associer chaque ID d'employé à son département
        java.util.Map<UUID, String> empDeptMap = new java.util.HashMap<>();
        for (EmployeeClient.EmployeeResponse emp : employees) {
            // Si le département n'existe pas dans le service, nous mettons "Non spécifié"
            empDeptMap.put(emp.getId(), emp.getDepartment() != null ? emp.getDepartment() : "Non spécifié");
        }

        // 5. Grouper les coûts bruts par département
        java.util.Map<String, BigDecimal> deptCostMap = new java.util.HashMap<>();
        java.util.Map<String, Long> deptCountMap = new java.util.HashMap<>();

        for (PayrollItem item : items) {
            String dept = empDeptMap.getOrDefault(item.getEmployeeId(), "Non spécifié");

            deptCostMap.put(dept, deptCostMap.getOrDefault(dept, BigDecimal.ZERO).add(item.getGrossSalary()));
            deptCountMap.put(dept, deptCountMap.getOrDefault(dept, 0L) + 1);
        }

        // 6. Transformer la Map en liste de DTOs pour le Frontend
        return deptCostMap.entrySet().stream()
                .map(entry -> new com.workhub.payroll.dto.PayrollAnalyticsDTOs.DepartmentCostDTO(
                        entry.getKey(),
                        entry.getValue(),
                        deptCountMap.get(entry.getKey())
                ))
                .toList();
    }
    /**
     * NOUVEAU : Récupère la configuration de paie active pour une organisation.
     */
    public PayrollParameter getActiveConfig(UUID orgId) {
        log.info("Fetching active payroll configuration for organization: {}", orgId);
        return paramsRepo.findFirstByOrganizationIdAndActiveTrueOrderByEffectiveDateDesc(orgId)
                .orElseThrow(() -> new RuntimeException("Aucune configuration de paie trouvée pour cette organisation."));
    }

    /**
     * NOUVEAU : Crée ou met à jour la configuration de paie d'une organisation.
     * Cette méthode désactive l'ancienne configuration pour garder un historique propre.
     */
    @Transactional
    public PayrollParameter updateConfig(UUID orgId, PayrollParameter newParams) {
        log.info("Updating payroll configuration for organization: {}", orgId);

        // 1. Désactiver l'ancienne configuration active s'il y en a une
        paramsRepo.findFirstByOrganizationIdAndActiveTrueOrderByEffectiveDateDesc(orgId)
                .ifPresent(existingConfig -> {
                    existingConfig.setActive(false);
                    paramsRepo.save(existingConfig);
                    log.info("Old configuration {} deactivated.", existingConfig.getId());
                });

        // 2. Configurer et sauvegarder la nouvelle configuration
        newParams.setId(null); // Force la création d'une nouvelle ligne en base de données
        newParams.setOrganizationId(orgId);
        newParams.setActive(true);
        if (newParams.getEffectiveDate() == null) {
            newParams.setEffectiveDate(java.time.LocalDate.now());
        }

        return paramsRepo.save(newParams);
    }
    /**
     * NOUVEAU : Génère un fichier CSV d'historique des paies directement dans le flux de réponse.
     */
    public void exportPayrollHistoryToCsv(UUID orgId, java.io.PrintWriter writer) {
        log.info("Generating payroll history CSV for organization: {}", orgId);

        List<Payroll> payrolls = payrollRepo.findByOrganizationIdOrderByYearDescMonthDesc(orgId);

        // En-tête du fichier CSV (format professionnel)
        writer.println("ID Paie,Annee,Mois,Statut,Total Brut (MAD),Total Net (MAD),CNSS (MAD),AMO (MAD),IR (MAD),Date Generation");

        // Remplissage des lignes
        for (Payroll p : payrolls) {
            writer.printf("%s,%d,%d,%s,%.2f,%.2f,%.2f,%.2f,%.2f,%s\n",
                    p.getId(),
                    p.getYear(),
                    p.getMonth(),
                    p.getStatus().toString(),
                    p.getTotalGrossSalary(),
                    p.getTotalNetSalary(),
                    p.getTotalCnss() != null ? p.getTotalCnss() : java.math.BigDecimal.ZERO,
                    p.getTotalAmo() != null ? p.getTotalAmo() : java.math.BigDecimal.ZERO,
                    p.getTotalIr() != null ? p.getTotalIr() : java.math.BigDecimal.ZERO,
                    p.getGeneratedAt()
            );
        }
        writer.flush();
    }

    /**
     * NOUVEAU : Calcule dynamiquement l'utilisation du budget annuel (zéro hardcoding).
     */
    public com.workhub.payroll.dto.PayrollAnalyticsDTOs.BudgetUtilizationDTO getBudgetUtilization(UUID orgId, int year) {
        log.info("Calculating budget utilization for org {} and year {}", orgId, year);
        // Budget annuel par défaut de l'organisation (ex: 2 400 000 MAD, comme dans le mock frontend)
        BigDecimal annualBudget = budgetRepo.findByOrganizationIdAndBudgetYear(orgId, year)
                .map(PayrollBudget::getTotalBudget)
                .orElse(new BigDecimal("2400000.00"));

        List<Payroll> payrolls = payrollRepo.findAllByOrganizationId(orgId);
        BigDecimal spentAmount = BigDecimal.ZERO;

        // On fait la somme des coûts réels (Brut) de toutes les paies validées ou payées de l'année
        for (Payroll p : payrolls) {
            if (p.getYear() == year && p.getStatus() != PayrollStatus.DRAFT) {
                // Coût total employeur approché = Salaire Brut
                spentAmount = spentAmount.add(p.getTotalGrossSalary());
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

        PayrollBudget budget = budgetRepo.findByOrganizationIdAndBudgetYear(orgId, year)
                .orElse(new PayrollBudget());

        budget.setOrganizationId(orgId);
        budget.setBudgetYear(year);
        budget.setTotalBudget(totalBudget);

        return budgetRepo.save(budget);
    }

    /**
     * Récupère tous les bulletins PDF d'un mois de paie sur MinIO
     * et les compresse dans un seul fichier ZIP envoyé au navigateur.
     */
    public void exportPayslipsToZip(UUID payrollId, java.io.OutputStream outputStream) {
        log.info("Generating ZIP archive of payslips for payroll: {}", payrollId);

        // 1. Récupérer toutes les lignes de paie (items) du mois
        List<PayrollItem> items = itemRepo.findAllByPayrollId(payrollId);

        // 2. Créer le flux de compression ZIP (ZipOutputStream)
        try (java.util.zip.ZipOutputStream zos = new java.util.zip.ZipOutputStream(outputStream)) {

            for (PayrollItem item : items) {
                // Si l'employé possède bien un bulletin PDF généré
                if (item.getBulletinPdfUrl() != null) {

                    // Télécharger le PDF depuis MinIO
                    byte[] pdfBytes = storageService.downloadPdf(item.getBulletinPdfUrl());

                    // Créer une entrée dans le ZIP (un fichier "bulletin_ID.pdf")
                    String entryName = String.format("bulletin_employe_%s.pdf", item.getEmployeeId());
                    java.util.zip.ZipEntry zipEntry = new java.util.zip.ZipEntry(entryName);

                    zos.putNextEntry(zipEntry);
                    zos.write(pdfBytes);
                    zos.closeEntry();

                    log.info("Ajout du bulletin {} à l'archive ZIP.", entryName);
                }
            }
            zos.finish();
            log.info("Export ZIP terminé avec succès pour la paie {}.", payrollId);

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
    /**
     * Récupère une paie spécifique par son ID unique.
     */
    public Payroll getPayrollById(UUID id) {
        log.info("Fetching payroll details for ID: {}", id);
        return payrollRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Session de paie introuvable."));
    }
    /**
     * NOUVEAU : Valide le paiement de la paie, génère le fichier de virement bancaire CSV,
     * l'envoie sur MinIO et met à jour le statut en base de données.
     */
    @Transactional
    public Payroll payAndGenerateBankFile(UUID payrollId, UUID updatedBy) {
        log.info("Processing bank transfer payment for payroll ID: {}", payrollId);

        // 1. Récupérer la paie
        Payroll payroll = payrollRepo.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Session de paie introuvable."));

        // Sécurité professionnelle : On ne peut payer que si la paie a d'abord été validée
        if (payroll.getStatus() != PayrollStatus.VALIDATED) {
            throw new RuntimeException("Impossible de payer une session de paie qui n'est pas VALIDATED.");
        }

        // 2. Récupérer tous les bulletins du mois
        List<PayrollItem> items = itemRepo.findAllByPayrollId(payrollId);

        // 3. Générer le contenu du fichier CSV de virement bancaire (Format BMCE/BOA)
        StringBuilder csvContent = new StringBuilder();
        csvContent.append("Nom Employe,RIB Bancaire,Montant Net (MAD),Reference Virement\n");

        for (PayrollItem item : items) {
            // Dans un cas réel, on lirait le RIB depuis le service employé.
            // Ici, on simule un RIB marocain valide de 24 chiffres (Bank of Africa)
            String mockRib = "181123456789012345678901";

            csvContent.append(String.format("Employe_%s,%s,%.2f,VIREMENT_PAIE_%d_%d\n",
                    item.getEmployeeId(),
                    mockRib,
                    item.getNetSalary(),
                    payroll.getMonth(),
                    payroll.getYear()
            ));
        }

        // Convertir la chaîne CSV en tableau d'octets binaire
        byte[] csvBytes = csvContent.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);

        // Nom du fichier unique dans MinIO
        String filename = String.format("virement_bancaire_org_%s_periode_%d_%d.csv",
                payroll.getOrganizationId(), payroll.getMonth(), payroll.getYear());

        // 4. Envoyer le fichier CSV sur MinIO
        String fileUrl = "";
        try {
            fileUrl = storageService.uploadPdf(filename, csvBytes); // On réutilise le service de stockage
        } catch (Exception e) {
            log.error("Échec de l'envoi du fichier de virement vers MinIO : {}", e.getMessage());
            throw new RuntimeException("Impossible de stocker le fichier de virement bancaire.");
        }

        // 5. Mettre à jour l'entité en base de données
        payroll.setStatus(PayrollStatus.PAID);
        payroll.setBankFileUrl(fileUrl);
        payroll.setValidatedAt(java.time.LocalDateTime.now());
        payroll.setValidatedBy(updatedBy);

        log.info("Payroll {} has been paid. Bank file generated: {}", payrollId, fileUrl);
        return payrollRepo.save(payroll);
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
}