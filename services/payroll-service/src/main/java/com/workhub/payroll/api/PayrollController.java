package com.workhub.payroll.api;

import com.workhub.payroll.domain.Payroll;
import com.workhub.payroll.domain.PayrollItem;
import com.workhub.payroll.repo.PayrollRepository;
import com.workhub.payroll.service.PayrollService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payrolls")
public class PayrollController {

    private final PayrollRepository repo;
    private final PayrollService payrollService;

    public PayrollController(PayrollRepository repo, PayrollService payrollService) {
        this.repo = repo;
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
        byte[] pdfContent = payrollService.getPayslipPdfContent(itemId);

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
            jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {

        // Configuration des en-têtes HTTP pour déclencher un téléchargement de fichier
        response.setContentType("text/csv");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"payroll_history_org_" + orgId + ".csv\"");

        payrollService.exportPayrollHistoryToCsv(orgId, response.getWriter());
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
}