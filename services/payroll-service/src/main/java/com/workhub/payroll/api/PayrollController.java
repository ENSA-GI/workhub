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
}