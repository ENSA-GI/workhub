package com.workhub.org.repo;

import com.workhub.org.domain.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    List<Department> findByOrganizationId(UUID organizationId);
}