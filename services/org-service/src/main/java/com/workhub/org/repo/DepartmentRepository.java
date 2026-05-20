package com.workhub.org.repo;

import com.workhub.org.domain.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    Page<Department> findByOrganizationId(UUID organizationId, Pageable pageable);
}