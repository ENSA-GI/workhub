package com.workhub.payroll.api;

import com.workhub.payroll.domain.Payroll;
import com.workhub.payroll.domain.PayrollStatus;
import com.workhub.payroll.repo.PayrollRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payrolls")
public class PayrollController {

    private final PayrollRepository repo;

    public PayrollController(PayrollRepository repo) {
        this.repo = repo;
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
        Payroll p = Payroll.builder()
                .id(UUID.randomUUID())
                .organizationId(req.organizationId())
                .month(req.month())
                .year(req.year())
                .status(PayrollStatus.DRAFT)
                .generatedBy(req.generatedBy())
                .generatedAt(Instant.now())
                .build();
        return repo.save(p);
    }
}