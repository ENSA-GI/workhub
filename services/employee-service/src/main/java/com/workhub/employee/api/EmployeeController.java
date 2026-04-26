package com.workhub.employee.api;

import com.workhub.employee.domain.*;
import com.workhub.employee.kafka.EmployeeEventsPublisher;
import com.workhub.employee.kafka.event.EmployeeCreatedEvent;
import com.workhub.employee.repo.EmployeeRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeRepository repo;
    private final EmployeeEventsPublisher publisher;

    public EmployeeController(EmployeeRepository repo, EmployeeEventsPublisher publisher) {
        this.repo = repo;
        this.publisher = publisher;
    }

    public record CreateEmployeeRequest(
            @NotNull UUID organizationId,
            @NotNull UUID userId,
            @NotBlank String cin,
            @NotNull LocalDate birthDate,
            String birthPlace,
            String address,
            String city,
            String postalCode,
            String personalPhone,
            String personalEmail,
            MaritalStatus maritalStatus,
            Integer childrenCount,
            @NotNull LocalDate hireDate,
            @NotNull ContractType contractType,
            LocalDate contractEndDate,
            @NotNull UUID departmentId,
            @NotNull UUID positionId,
            @NotNull ProfessionalCategory category,
            @NotNull BigDecimal baseSalary,
            BigDecimal transportBonus,
            BigDecimal mealBonus
    ) {}

    @GetMapping
    public List<Employee> list(@RequestParam UUID organizationId) {
        return repo.findByOrganizationId(organizationId);
    }

    @PostMapping
    public Employee create(@RequestBody @Valid CreateEmployeeRequest req) {
        Employee e = Employee.builder()
                .id(UUID.randomUUID())
                .organizationId(req.organizationId())
                .userId(req.userId())
                .cin(req.cin())
                .birthDate(req.birthDate())
                .birthPlace(req.birthPlace())
                .address(req.address())
                .city(req.city())
                .postalCode(req.postalCode())
                .personalPhone(req.personalPhone())
                .personalEmail(req.personalEmail())
                .maritalStatus(req.maritalStatus() == null ? MaritalStatus.SINGLE : req.maritalStatus())
                .childrenCount(req.childrenCount() == null ? 0 : req.childrenCount())
                .hireDate(req.hireDate())
                .contractType(req.contractType())
                .contractEndDate(req.contractEndDate())
                .departmentId(req.departmentId())
                .positionId(req.positionId())
                .category(req.category())
                .baseSalary(req.baseSalary())
                .transportBonus(req.transportBonus() == null ? BigDecimal.ZERO : req.transportBonus())
                .mealBonus(req.mealBonus() == null ? BigDecimal.ZERO : req.mealBonus())
                .status(EmployeeStatus.ACTIVE)
                .build();

        Employee saved = repo.save(e);

        publisher.employeeCreated(new EmployeeCreatedEvent(
                saved.getId(),
                saved.getOrganizationId(),
                saved.getUserId(),
                saved.getHireDate().toString()
        ));

        return saved;
    }
}