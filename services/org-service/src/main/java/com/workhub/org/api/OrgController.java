package com.workhub.org.api;

import com.workhub.org.domain.*;
import com.workhub.org.repo.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class OrgController {

    private final OrganizationRepository orgRepo;
    private final DepartmentRepository deptRepo;
    private final PositionRepository posRepo;

    public OrgController(OrganizationRepository orgRepo,
                         DepartmentRepository deptRepo,
                         PositionRepository posRepo) {
        this.orgRepo = orgRepo;
        this.deptRepo = deptRepo;
        this.posRepo = posRepo;
    }

    // ---------- DTOs ----------
    public record CreateOrganizationRequest(
            @NotBlank String name,
            @NotBlank String legalName,
            String city
    ) {}

    public record CreateDepartmentRequest(
            @NotNull UUID organizationId,
            @NotBlank String name,
            String description
    ) {}

    public record CreatePositionRequest(
            @NotNull UUID organizationId,
            @NotBlank String title,
            String description,
            @NotNull ProfessionalCategory category
    ) {}

    // ---------- Organizations ----------
    @PostMapping("/orgs")
    public Organization createOrg(@RequestBody @Valid CreateOrganizationRequest req) {
        Organization org = Organization.builder()
                .id(UUID.randomUUID())
                .name(req.name())
                .legalName(req.legalName())
                .city(req.city())
                .active(true)
                .build();
        return orgRepo.save(org);
    }

    @GetMapping("/orgs")
    public List<Organization> listOrgs() {
        return orgRepo.findAll();
    }

    // ---------- Departments ----------
    @PostMapping("/departments")
    public Department createDepartment(@RequestBody @Valid CreateDepartmentRequest req) {
        Department d = Department.builder()
                .id(UUID.randomUUID())
                .organizationId(req.organizationId())
                .name(req.name())
                .description(req.description())
                .active(true)
                .build();
        return deptRepo.save(d);
    }

    @GetMapping("/orgs/{orgId}/departments")
    public List<Department> listDepartments(@PathVariable UUID orgId) {
        return deptRepo.findByOrganizationId(orgId);
    }

    // ---------- Positions ----------
    @PostMapping("/positions")
    public Position createPosition(@RequestBody @Valid CreatePositionRequest req) {
        Position p = Position.builder()
                .id(UUID.randomUUID())
                .organizationId(req.organizationId())
                .title(req.title())
                .description(req.description())
                .category(req.category())
                .active(true)
                .build();
        return posRepo.save(p);
    }

    @GetMapping("/orgs/{orgId}/positions")
    public List<Position> listPositions(@PathVariable UUID orgId) {
        return posRepo.findByOrganizationId(orgId);
    }
}