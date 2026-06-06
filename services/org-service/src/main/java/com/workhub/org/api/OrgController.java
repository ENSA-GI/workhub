package com.workhub.org.api;

import com.workhub.org.domain.ProfessionalCategory;
import com.workhub.org.dto.*;
import com.workhub.org.service.DepartmentService;
import com.workhub.org.service.OrganizationService;
import com.workhub.org.service.PositionService;
import com.workhub.org.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class OrgController {

    private final OrganizationService orgService;
    private final DepartmentService deptService;
    private final PositionService posService;

    public OrgController(OrganizationService orgService,
                         DepartmentService deptService,
                         PositionService posService) {
        this.orgService = orgService;
        this.deptService = deptService;
        this.posService = posService;
    }

    // ---------- Organizations ----------
    @PostMapping("/orgs/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterOrganizationResponse registerOrg(@RequestBody @Valid RegisterOrganizationRequest req) {
        return orgService.registerOrganization(req);
    }

    @PostMapping("/orgs")
    @ResponseStatus(HttpStatus.CREATED)
    public OrganizationResponse createOrg(@RequestBody @Valid CreateOrganizationRequest req) {
        return orgService.createOrganization(req);
    }

    @GetMapping("/orgs")
    public Page<OrganizationResponse> listOrgs(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Boolean active,
            Pageable pageable) {
        return orgService.getAllOrganizations(name, city, active, pageable);
    }

    @GetMapping("/orgs/{id}")
    public OrganizationResponse getOrgById(@PathVariable UUID id) {
        SecurityUtils.validateOrganizationAccess(id);
        return orgService.getOrganizationById(id);
    }

    @PutMapping("/orgs/{id}")
    public OrganizationResponse updateOrg(@PathVariable UUID id, @RequestBody @Valid UpdateOrganizationRequest req) {
        SecurityUtils.validateOrganizationAccess(id);
        return orgService.updateOrganization(id, req);
    }

    @DeleteMapping("/orgs/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrg(@PathVariable UUID id) {
        SecurityUtils.validateOrganizationAccess(id);
        orgService.deleteOrganization(id);
    }

    // ---------- Departments ----------
    @PostMapping("/departments")
    @ResponseStatus(HttpStatus.CREATED)
    public DepartmentResponse createDepartment(@RequestBody @Valid CreateDepartmentRequest req) {
        SecurityUtils.validateOrganizationAccess(req.organizationId());
        return deptService.createDepartment(req);
    }

    @GetMapping("/orgs/{orgId}/departments")
    public Page<DepartmentResponse> listDepartments(
            @PathVariable UUID orgId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean active,
            Pageable pageable) {
        SecurityUtils.validateOrganizationAccess(orgId);
        return deptService.getDepartmentsByOrganizationId(orgId, name, active, pageable);
    }

    @GetMapping("/departments/{id}")
    public DepartmentResponse getDepartmentById(@PathVariable UUID id) {
        DepartmentResponse dept = deptService.getDepartmentById(id);
        SecurityUtils.validateOrganizationAccess(dept.organizationId());
        return dept;
    }

    @PutMapping("/departments/{id}")
    public DepartmentResponse updateDepartment(@PathVariable UUID id, @RequestBody @Valid UpdateDepartmentRequest req) {
        DepartmentResponse dept = deptService.getDepartmentById(id);
        SecurityUtils.validateOrganizationAccess(dept.organizationId());
        return deptService.updateDepartment(id, req);
    }

    @DeleteMapping("/departments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDepartment(@PathVariable UUID id) {
        DepartmentResponse dept = deptService.getDepartmentById(id);
        SecurityUtils.validateOrganizationAccess(dept.organizationId());
        deptService.deleteDepartment(id);
    }

    // ---------- Positions ----------
    @PostMapping("/positions")
    @ResponseStatus(HttpStatus.CREATED)
    public PositionResponse createPosition(@RequestBody @Valid CreatePositionRequest req) {
        SecurityUtils.validateOrganizationAccess(req.organizationId());
        return posService.createPosition(req);
    }

    @GetMapping("/orgs/{orgId}/positions")
    public Page<PositionResponse> listPositions(
            @PathVariable UUID orgId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) ProfessionalCategory category,
            @RequestParam(required = false) Boolean active,
            Pageable pageable) {
        SecurityUtils.validateOrganizationAccess(orgId);
        return posService.getPositionsByOrganizationId(orgId, title, category, active, pageable);
    }

    @GetMapping("/positions/{id}")
    public PositionResponse getPositionById(@PathVariable UUID id) {
        PositionResponse pos = posService.getPositionById(id);
        SecurityUtils.validateOrganizationAccess(pos.organizationId());
        return pos;
    }

    @PutMapping("/positions/{id}")
    public PositionResponse updatePosition(@PathVariable UUID id, @RequestBody @Valid UpdatePositionRequest req) {
        PositionResponse pos = posService.getPositionById(id);
        SecurityUtils.validateOrganizationAccess(pos.organizationId());
        return posService.updatePosition(id, req);
    }

    @DeleteMapping("/positions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePosition(@PathVariable UUID id) {
        PositionResponse pos = posService.getPositionById(id);
        SecurityUtils.validateOrganizationAccess(pos.organizationId());
        posService.deletePosition(id);
    }

    // ---------- Settings & Dashboard ----------
    @GetMapping("/orgs/{id}/settings")
    public OrganizationSettingsResponse getSettings(@PathVariable UUID id) {
        SecurityUtils.validateOrganizationAccess(id);
        return orgService.getOrganizationSettings(id);
    }

    @PutMapping("/orgs/{id}/settings")
    public OrganizationSettingsResponse updateSettings(@PathVariable UUID id, @RequestBody @Valid UpdateOrganizationSettingsRequest req) {
        SecurityUtils.validateOrganizationAccess(id);
        return orgService.updateOrganizationSettings(id, req);
    }

    @GetMapping("/orgs/{id}/dashboard")
    public OrgDashboardResponse getDashboard(@PathVariable UUID id) {
        SecurityUtils.validateOrganizationAccess(id);
        return orgService.getOrganizationDashboard(id);
    }
}