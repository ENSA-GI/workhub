package com.workhub.payroll.api;

import com.workhub.payroll.domain.Payroll;
import com.workhub.payroll.domain.PayrollItem;
import com.workhub.payroll.domain.PayrollAdjustment;
import com.workhub.payroll.dto.PayrollAdjustmentDTO;
import com.workhub.payroll.repo.PayrollRepository;
import com.workhub.payroll.repo.PayrollAdjustmentRepository;
import com.workhub.payroll.service.PayrollService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payrolls")
public class PayrollController {

    private final PayrollRepository repo;
    private final PayrollAdjustmentRepository adjustmentRepo;
    private final PayrollService payrollService;

    public PayrollController(PayrollRepository repo, PayrollAdjustmentRepository adjustmentRepo, PayrollService payrollService) {
        this.repo = repo;
        this.adjustmentRepo = adjustmentRepo;
        this.payrollService = payrollService;
    }

    public record CreatePayrollRequest(
            @NotNull UUID organizationId,
            @Min(1) @Max(12) int month,
            @Min(2024) int year,
            @NotNull UUID generatedBy
    ) {}

    @GetMapping
    public List<Payroll> list(@RequestParam UUID organizationId) {
        return repo.findByOrganizationIdOrderByYearDescMonthDesc(organizationId);
    }

    @PostMapping
    public Payroll create(@RequestBody @Valid CreatePayrollRequest req) {
        // Appel du service métier qui :
        // 1. Récupère les employés actifs
        // 2. Calcule les salaires avec les règles de paie
        // 3. Persiste les données
        // 4. PUBLIE L'ÉVÉNEMENT KAFKA
        return payrollService.generateMonthlyPayroll(
                req.organizationId(),
                req.month(),
                req.year(),
                req.generatedBy()
        );
    }

    // Added: convenience endpoint to match existing callers that use query params
    // Example: POST /api/payrolls/generate?orgId=<uuid>&month=5&year=2026&generatedBy=<uuid>
    @PostMapping("/generate")
    public Payroll generateFromParams(
            @RequestParam("orgId") UUID organizationId,
            @RequestParam("month") int month,
            @RequestParam("year") int year,
            @RequestParam("generatedBy") UUID generatedBy
    ) {
        return payrollService.generateMonthlyPayroll(
                organizationId,
                month,
                year,
                generatedBy
        );
    }
    /**
     * GET /api/payrolls/employee/{employeeId}
     * Permet à l'employé de récupérer la liste de tous ses bulletins.
     */
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PayrollItem>> getEmployeeBulletins(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(payrollService.getEmployeePayslips(employeeId));
    }

    /**
     * GET /api/payrolls/items/{itemId}/download
     * Permet de télécharger le fichier PDF physique depuis MinIO.
     */
    @GetMapping("/items/{itemId}/download")
    public ResponseEntity<byte[]> downloadPayslipPdf(@PathVariable UUID itemId) {
        byte[] pdfContent = payrollService.generateFreshPayslipPdf(itemId);

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"bulletin_" + itemId + ".pdf\"")
                .body(pdfContent);
    }

    /**
     * PUT /api/payrolls/{id}/status
     * Permet de valider ou payer une paie.
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Payroll> updateStatus(
            @PathVariable UUID id,
            @RequestParam com.workhub.payroll.domain.PayrollStatus status,
            @RequestHeader("X-User-Id") UUID updatedBy) {
        return ResponseEntity.ok(payrollService.updatePayrollStatus(id, status, updatedBy));
    }

    /**
     * GET /api/payrolls/analytics/ytd
     * Pour les cartes KPI de synthèse annuelle.
     */
    @GetMapping("/analytics/ytd")
    public ResponseEntity<com.workhub.payroll.dto.PayrollAnalyticsDTOs.YtdSummaryDTO> getYtdSummary(
            @RequestParam UUID orgId,
            @RequestParam int year) {
        return ResponseEntity.ok(payrollService.getYtdSummary(orgId, year));
    }

    /**
     * GET /api/payrolls/analytics/trend
     * Pour le graphique linéaire d'évolution.
     */
    @GetMapping("/analytics/trend")
    public ResponseEntity<List<com.workhub.payroll.dto.PayrollAnalyticsDTOs.MonthlyTrendDTO>> getTrend(
            @RequestParam UUID orgId,
            @RequestParam int year) {
        return ResponseEntity.ok(payrollService.getMonthlyTrend(orgId, year));
    }

    /**
     * GET /api/payrolls/analytics/charges
     * Pour le camembert de répartition des taxes.
     */
    @GetMapping("/analytics/charges")
    public ResponseEntity<com.workhub.payroll.dto.PayrollAnalyticsDTOs.ChargesDistributionDTO> getCharges(
            @RequestParam UUID orgId,
            @RequestParam int year) {
        return ResponseEntity.ok(payrollService.getChargesDistribution(orgId, year));
    }
    /**
     * GET /api/payrolls/{id}/items
     * Retourne la liste de tous les bulletins d'une paie (utile pour PayslipsManagement.tsx)
     */
    @GetMapping("/{id}/items")
    public ResponseEntity<List<PayrollItem>> getPayrollItems(@PathVariable UUID id) {
        return ResponseEntity.ok(payrollService.getPayrollItems(id));
    }

    /**
     * GET /api/payrolls/analytics/by-department
     * Utilisé pour alimenter le graphique par département (BarChart)
     */
    @GetMapping("/analytics/by-department")
    public ResponseEntity<List<com.workhub.payroll.dto.PayrollAnalyticsDTOs.DepartmentCostDTO>> getDepartmentCosts(
            @RequestParam UUID orgId,
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(payrollService.getDepartmentCosts(orgId, month, year));
    }
    /**
     * GET /api/payrolls/config
     * Permet à l'administrateur de consulter ses taux de paie actuels.
     */
    @GetMapping("/config")
    public ResponseEntity<com.workhub.payroll.domain.PayrollParameter> getActiveConfig(@RequestParam UUID orgId) {
        return ResponseEntity.ok(payrollService.getActiveConfig(orgId));
    }

    /**
     * PUT /api/payrolls/config
     * Permet de modifier ou d'ajouter une nouvelle configuration de paie.
     */
    @PutMapping("/config")
    public ResponseEntity<com.workhub.payroll.domain.PayrollParameter> updateConfig(
            @RequestParam UUID orgId,
            @RequestBody com.workhub.payroll.domain.PayrollParameter newParams) {
        return ResponseEntity.ok(payrollService.updateConfig(orgId, newParams));
    }

    /**
     * GET /api/payrolls/export/csv
     * Génère et lance le téléchargement d'un fichier CSV de l'historique des paies.
     */
    @GetMapping("/export/csv")
    public void exportPayrollHistoryToCsv(
            @RequestParam UUID orgId,
            @RequestParam(required = false) Integer year,
            jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {

        // Configuration des en-têtes HTTP pour déclencher un téléchargement de fichier
        response.setContentType("text/csv");
        response.setCharacterEncoding("UTF-8");
        String period = year != null ? year.toString() : "all";
        response.setHeader("Content-Disposition", "attachment; filename=\"payroll_history_" + period + ".csv\"");

        payrollService.exportPayrollHistoryToCsv(orgId, year, response.getWriter());
    }

    /**
     * GET /api/payrolls/export/report
     * Genere un rapport PDF professionnel de l'historique des paies.
     */
    @GetMapping("/export/report")
    public ResponseEntity<byte[]> exportPayrollHistoryReport(
            @RequestParam UUID orgId,
            @RequestParam(required = false) Integer year) {

        String period = year != null ? year.toString() : "all";
        byte[] report = payrollService.generatePayrollHistoryReportPdf(orgId, year);

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"rapport_paie_" + period + ".pdf\"")
                .body(report);
    }

    /**
     * GET /api/payrolls/budget/utilization
     * Retourne le taux d'utilisation en temps réel du budget annuel de l'organisation.
     */
    @GetMapping("/budget/utilization")
    public ResponseEntity<com.workhub.payroll.dto.PayrollAnalyticsDTOs.BudgetUtilizationDTO> getBudgetUtilization(
            @RequestParam UUID orgId,
            @RequestParam int year) {
        return ResponseEntity.ok(payrollService.getBudgetUtilization(orgId, year));
    }

    /**
     * GET /api/payrolls/{id}/payslips/export-zip
     * Permet au RH de télécharger toutes les fiches de paie du mois compressées dans un fichier ZIP.
     */
    @GetMapping("/{id}/payslips/export-zip")
    public void exportPayslipsToZip(
            @PathVariable UUID id,
            jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {

        // Configuration des en-têtes HTTP pour un fichier ZIP binaires
        response.setContentType("application/zip");
        response.setHeader("Content-Disposition", "attachment; filename=\"bulletins_paie_session_" + id + ".zip\"");

        payrollService.exportPayslipsToZip(id, response.getOutputStream());
    }
    /**
     * GET /api/payrolls/search
     * Filtre et recherche les paies d'une organisation (ex: ?orgId=xxx&year=2026&status=PAID)
     */
    @GetMapping("/search")
    public ResponseEntity<List<Payroll>> searchPayrolls(
            @RequestParam UUID orgId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) com.workhub.payroll.domain.PayrollStatus status) {

        return ResponseEntity.ok(payrollService.searchPayrolls(orgId, year, month, status));
    }
    /**
     * GET /api/payrolls/{id}
     * Récupère les détails globaux d'une seule session de paie par son ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Payroll> getPayrollById(@PathVariable UUID id) {
        return ResponseEntity.ok(payrollService.getPayrollById(id));
    }
    /**
     * POST /api/payrolls/{id}/pay
     * Marque la paie comme PAYÉE et génère le fichier de virement bancaire CSV sur MinIO.
     */
    @PostMapping("/{id}/pay")
    public ResponseEntity<Payroll> payPayroll(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID updatedBy) {
        return ResponseEntity.ok(payrollService.payAndGenerateBankFile(id, updatedBy));
    }
    /**
     * PUT /api/payrolls/items/{itemId}/read
     * Marque un bulletin individuel comme lu (appelé par le Frontend dès que l'employé ouvre le PDF).
     */
    @PutMapping("/items/{itemId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID itemId) {
        payrollService.markPayslipAsRead(itemId);
        return ResponseEntity.ok().build();
    }
    /**
     * POST /api/payrolls/budget
     * Configure ou met à jour le budget annuel de paie d'une organisation.
     */
    @PostMapping("/budget")
    public ResponseEntity<com.workhub.payroll.domain.PayrollBudget> saveOrUpdateBudget(
            @RequestParam UUID orgId,
            @RequestParam int year,
            @RequestParam BigDecimal totalBudget) {
        return ResponseEntity.ok(payrollService.saveOrUpdateBudget(orgId, year, totalBudget));
    }

    /**
     * POST /api/payrolls/items/{itemId}/adjustments
     * Ajoute un ajustement (heures supp, prime, déduction) à un bulletin
     */
    @PostMapping("/items/{itemId}/adjustments")
    public ResponseEntity<PayrollAdjustment> addAdjustment(
            @PathVariable UUID itemId,
            @RequestBody @Valid PayrollAdjustmentDTO dto) {
        return ResponseEntity.ok(payrollService.addAdjustment(itemId, dto));
    }

    /**
     * DELETE /api/payrolls/adjustments/{adjustmentId}
     * Supprime un ajustement
     */
    @DeleteMapping("/adjustments/{adjustmentId}")
    public ResponseEntity<Void> deleteAdjustment(@PathVariable UUID adjustmentId) {
        payrollService.deleteAdjustment(adjustmentId);
        return ResponseEntity.noContent().build();
    }
}
