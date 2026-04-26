package com.workhub.payroll.repo;

import com.workhub.payroll.domain.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PayrollRepository extends JpaRepository<Payroll, UUID> {
    List<Payroll> findByOrganizationIdOrderByYearDescMonthDesc(UUID organizationId);
}