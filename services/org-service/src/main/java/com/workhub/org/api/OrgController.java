package com.workhub.org.api;

import com.workhub.org.domain.Department;
import com.workhub.org.domain.Organization;
import com.workhub.org.domain.Position;
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
    @PostMapping("/orgs")
    @ResponseStatus(HttpStatus.CREATED)
    public Organization createOrg(@RequestBody @Valid CreateOrganizationRequest req) {
        return orgService.createOrganization(req);
    }

    @GetMapping("/orgs")
    public Page<Organization> listOrgs(Pageable pageable) {
        return orgService.getAllOrganizations(pageable);
    }

    @GetMapping("/orgs/{id}")
    public Organization getOrgById(@PathVariable UUID id) {
        SecurityUtils.validateOrganizationAccess(id);
        return orgService.getOrganizationById(id);
    }

    @PutMapping("/orgs/{id}")
    public Organization updateOrg(@PathVariable UUID id, @RequestBody @Valid UpdateOrganizationRequest req) {
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
    public Department createDepartment(@RequestBody @Valid CreateDepartmentRequest req) {
        SecurityUtils.validateOrganizationAccess(req.organizationId());
        return deptService.createDepartment(req);
    }

    @GetMapping("/orgs/{orgId}/departments")
    public Page<Department> listDepartments(@PathVariable UUID orgId, Pageable pageable) {
        SecurityUtils.validateOrganizationAccess(orgId);
        return deptService.getDepartmentsByOrganizationId(orgId, pageable);
    }

    @GetMapping("/departments/{id}")
    public Department getDepartmentById(@PathVariable UUID id) {
        Department dept = deptService.getDepartmentById(id);
        SecurityUtils.validateOrganizationAccess(dept.getOrganizationId());
        return dept;
    }

    @PutMapping("/departments/{id}")
    public Department updateDepartment(@PathVariable UUID id, @RequestBody @Valid UpdateDepartmentRequest req) {
        Department dept = deptService.getDepartmentById(id);
        SecurityUtils.validateOrganizationAccess(dept.getOrganizationId());
        return deptService.updateDepartment(id, req);
    }

    @DeleteMapping("/departments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDepartment(@PathVariable UUID id) {
        Department dept = deptService.getDepartmentById(id);
        SecurityUtils.validateOrganizationAccess(dept.getOrganizationId());
        deptService.deleteDepartment(id);
    }

    // ---------- Positions ----------
    @PostMapping("/positions")
    @ResponseStatus(HttpStatus.CREATED)
    public Position createPosition(@RequestBody @Valid CreatePositionRequest req) {
        SecurityUtils.validateOrganizationAccess(req.organizationId());
        return posService.createPosition(req);
    }

    @GetMapping("/orgs/{orgId}/positions")
    public Page<Position> listPositions(@PathVariable UUID orgId, Pageable pageable) {
        SecurityUtils.validateOrganizationAccess(orgId);
        return posService.getPositionsByOrganizationId(orgId, pageable);
    }

    @GetMapping("/positions/{id}")
    public Position getPositionById(@PathVariable UUID id) {
        Position pos = posService.getPositionById(id);
        SecurityUtils.validateOrganizationAccess(pos.getOrganizationId());
        return pos;
    }

    @PutMapping("/positions/{id}")
    public Position updatePosition(@PathVariable UUID id, @RequestBody @Valid UpdatePositionRequest req) {
        Position pos = posService.getPositionById(id);
        SecurityUtils.validateOrganizationAccess(pos.getOrganizationId());
        return posService.updatePosition(id, req);
    }

    @DeleteMapping("/positions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePosition(@PathVariable UUID id) {
        Position pos = posService.getPositionById(id);
        SecurityUtils.validateOrganizationAccess(pos.getOrganizationId());
        posService.deletePosition(id);
    }
}