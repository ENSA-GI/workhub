package com.workhub.org.repo;

import com.workhub.org.domain.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface DepartmentRepository extends JpaRepository<Department, UUID>, JpaSpecificationExecutor<Department> {
    Page<Department> findByOrganizationId(UUID organizationId, Pageable pageable);
    Page<Department> findByOrganizationIdAndNameContainingIgnoreCase(UUID organizationId, String name, Pageable pageable);
    boolean existsByOrganizationIdAndName(UUID organizationId, String name);
    boolean existsByOrganizationIdAndNameAndIdNot(UUID organizationId, String name, UUID id);
    long countByOrganizationIdAndActiveTrue(UUID organizationId);
}