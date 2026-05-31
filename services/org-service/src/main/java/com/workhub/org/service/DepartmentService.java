package com.workhub.org.service;

import com.workhub.org.api.exception.BusinessRuleException;
import com.workhub.org.api.exception.DuplicateResourceException;
import com.workhub.org.api.exception.ResourceNotFoundException;
import com.workhub.org.domain.Department;
import com.workhub.org.dto.CreateDepartmentRequest;
import com.workhub.org.dto.DepartmentResponse;
import com.workhub.org.dto.UpdateDepartmentRequest;
import com.workhub.org.event.DepartmentEvent;
import com.workhub.org.mapper.DepartmentMapper;
import com.workhub.org.messaging.KafkaEventPublisher;
import com.workhub.org.repo.DepartmentRepository;
import com.workhub.org.repo.PositionRepository;
import com.workhub.org.repo.specification.DepartmentSpecifications;
import org.springframework.data.jpa.domain.Specification;
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
    private final DepartmentMapper mapper;
    private final PositionRepository posRepo;
    private final KafkaEventPublisher eventPublisher;

    public DepartmentService(DepartmentRepository deptRepo, OrganizationService orgService,
                             DepartmentMapper mapper, PositionRepository posRepo, KafkaEventPublisher eventPublisher) {
        this.deptRepo = deptRepo;
        this.orgService = orgService;
        this.mapper = mapper;
        this.posRepo = posRepo;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public DepartmentResponse createDepartment(CreateDepartmentRequest req) {
        // Validate that organization exists
        orgService.getOrganizationById(req.organizationId());
        // Check duplicate name in same organization
        if (deptRepo.existsByOrganizationIdAndName(req.organizationId(), req.name())) {
            throw new DuplicateResourceException(
                "Un département '" + req.name() + "' existe déjà dans cette organisation");
        }

        Department d = Department.builder()
                .id(UUID.randomUUID())
                .organizationId(req.organizationId())
                .name(req.name())
                .description(req.description())
                .active(true)
                .build();
        Department saved = deptRepo.save(d);
        eventPublisher.publishDepartmentEvent(new DepartmentEvent(
                saved.getId(), saved.getOrganizationId(), saved.getName(), saved.getManagerEmployeeId(), "CREATED"));
        return mapper.toResponse(saved);
    }

    public Page<DepartmentResponse> getDepartmentsByOrganizationId(UUID orgId, String name, Boolean active, Pageable pageable) {
        Specification<Department> spec = Specification.where(DepartmentSpecifications.hasOrganizationId(orgId))
                .and(DepartmentSpecifications.hasName(name))
                .and(DepartmentSpecifications.isActive(active));
        return deptRepo.findAll(spec, pageable).map(mapper::toResponse);
    }

    public DepartmentResponse getDepartmentById(UUID id) {
        return mapper.toResponse(getDepartmentEntityById(id));
    }

    public Department getDepartmentEntityById(UUID id) {
        return deptRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    @Transactional
    public DepartmentResponse updateDepartment(UUID id, UpdateDepartmentRequest req) {
        Department dept = getDepartmentEntityById(id);
        // Check duplicate name (excluding current department)
        if (deptRepo.existsByOrganizationIdAndNameAndIdNot(dept.getOrganizationId(), req.name(), id)) {
            throw new DuplicateResourceException(
                "Un département '" + req.name() + "' existe déjà dans cette organisation");
        }
        dept.setName(req.name());
        dept.setDescription(req.description());
        if (req.active() != null) {
            dept.setActive(req.active());
        }
        Department saved = deptRepo.save(dept);
        eventPublisher.publishDepartmentEvent(new DepartmentEvent(
                saved.getId(), saved.getOrganizationId(), saved.getName(), saved.getManagerEmployeeId(), "UPDATED"));
        return mapper.toResponse(saved);
    }

    @Transactional
    public void deleteDepartment(UUID id) {
        Department dept = getDepartmentEntityById(id);
        // Business rule: cannot delete department with active positions
        long activePositions = posRepo.countByOrganizationIdAndActiveTrue(dept.getOrganizationId());
        if (activePositions > 0) {
            throw new BusinessRuleException(
                "Impossible de supprimer le département '" + dept.getName() +
                "' : il contient encore " + activePositions + " poste(s) actif(s)");
        }
        dept.setActive(false);
        Department saved = deptRepo.save(dept);
        eventPublisher.publishDepartmentEvent(new DepartmentEvent(
                saved.getId(), saved.getOrganizationId(), saved.getName(), saved.getManagerEmployeeId(), "DELETED"));
    }
}
