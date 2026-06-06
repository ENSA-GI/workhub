package com.workhub.payroll.repo;

import com.workhub.payroll.domain.PayrollAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PayrollAdjustmentRepository extends JpaRepository<PayrollAdjustment, UUID> {
    List<PayrollAdjustment> findByPayrollItemId(UUID payrollItemId);
}

