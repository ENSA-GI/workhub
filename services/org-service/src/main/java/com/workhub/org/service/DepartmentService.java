package com.workhub.org.service;

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
import com.workhub.org.repo.specification.DepartmentSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository deptRepo;
    private final OrganizationService orgService;
    private final DepartmentMapper mapper;
    private final KafkaEventPublisher eventPublisher;

    public DepartmentService(DepartmentRepository deptRepo,
                             OrganizationService orgService,
                             DepartmentMapper mapper,
                             KafkaEventPublisher eventPublisher) {
        this.deptRepo = deptRepo;
        this.orgService = orgService;
        this.mapper = mapper;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public DepartmentResponse createDepartment(CreateDepartmentRequest req) {
        orgService.getOrganizationById(req.organizationId());
        Department existing = deptRepo.findByOrganizationIdAndName(req.organizationId(), req.name()).orElse(null);
        if (existing != null && Boolean.TRUE.equals(existing.getActive())) {
            throw new DuplicateResourceException(
                    "Un departement '" + req.name() + "' existe deja dans cette organisation");
        }
        if (existing != null) {
            existing.setDescription(req.description());
            existing.setActive(true);
            Department saved = deptRepo.save(existing);
            eventPublisher.publishDepartmentEvent(new DepartmentEvent(
                    saved.getId(), saved.getOrganizationId(), saved.getName(), saved.getManagerEmployeeId(), "UPDATED"));
            return mapper.toResponse(saved);
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
        if (req.name() != null && deptRepo.existsByOrganizationIdAndNameAndIdNot(dept.getOrganizationId(), req.name(), id)) {
            throw new DuplicateResourceException(
                    "Un departement '" + req.name() + "' existe deja dans cette organisation");
        }
        if (req.name() != null) dept.setName(req.name());
        if (req.description() != null) dept.setDescription(req.description());
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
        dept.setActive(false);
        Department saved = deptRepo.save(dept);
        eventPublisher.publishDepartmentEvent(new DepartmentEvent(
                saved.getId(), saved.getOrganizationId(), saved.getName(), saved.getManagerEmployeeId(), "DELETED"));
    }
}
