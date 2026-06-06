package com.workhub.employee.repo;

import com.workhub.employee.domain.Employee;
import com.workhub.employee.domain.EmployeeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    List<Employee> findByOrganizationIdAndStatus(UUID organizationId, EmployeeStatus status);

    Page<Employee> findByOrganizationIdAndStatus(UUID organizationId, EmployeeStatus status, Pageable pageable);

    Optional<Employee> findByIdAndOrganizationId(UUID id, UUID organizationId);

    Optional<Employee> findByUserIdAndOrganizationId(UUID userId, UUID organizationId);

    boolean existsByOrganizationIdAndCin(UUID organizationId, String cin);

    boolean existsByOrganizationIdAndPersonalEmail(UUID organizationId, String email);

    @Query("SELECT e FROM Employee e WHERE e.organizationId = :orgId AND e.status = :status " +
            "AND (LOWER(e.cin) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(e.personalEmail) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Employee> searchEmployees(@Param("orgId") UUID orgId,
                                   @Param("status") EmployeeStatus status,
                                   @Param("search") String search,
                                   Pageable pageable);
}