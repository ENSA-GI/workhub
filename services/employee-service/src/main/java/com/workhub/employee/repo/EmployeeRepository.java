package com.workhub.employee.repo;

import com.workhub.employee.domain.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
    List<Employee> findByOrganizationId(UUID organizationId);
}
