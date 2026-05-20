package com.workhub.org.service;

import com.workhub.org.api.exception.ResourceNotFoundException;
import com.workhub.org.domain.Department;
import com.workhub.org.dto.CreateDepartmentRequest;
import com.workhub.org.dto.UpdateDepartmentRequest;
import com.workhub.org.repo.DepartmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository deptRepo;
    private final OrganizationService orgService;

    public DepartmentService(DepartmentRepository deptRepo, OrganizationService orgService) {
        this.deptRepo = deptRepo;
        this.orgService = orgService;
    }

    @Transactional
    public Department createDepartment(CreateDepartmentRequest req) {
        // Validate that organization exists
        orgService.getOrganizationById(req.organizationId());

        Department d = Department.builder()
                .id(UUID.randomUUID())
                .organizationId(req.organizationId())
                .name(req.name())
                .description(req.description())
                .active(true)
                .build();
        return deptRepo.save(d);
    }

    public Page<Department> getDepartmentsByOrganizationId(UUID orgId, Pageable pageable) {
        return deptRepo.findByOrganizationId(orgId, pageable);
    }

    public Department getDepartmentById(UUID id) {
        return deptRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    @Transactional
    public Department updateDepartment(UUID id, UpdateDepartmentRequest req) {
        Department dept = getDepartmentById(id);
        dept.setName(req.name());
        dept.setDescription(req.description());
        if (req.active() != null) {
            dept.setActive(req.active());
        }
        return deptRepo.save(dept);
    }

    @Transactional
    public void deleteDepartment(UUID id) {
        Department dept = getDepartmentById(id);
        dept.setActive(false);
        deptRepo.save(dept);
    }
}
