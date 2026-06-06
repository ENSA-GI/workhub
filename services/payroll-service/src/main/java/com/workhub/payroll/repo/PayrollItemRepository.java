package com.workhub.payroll.repo;

import com.workhub.payroll.domain.PayrollItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface PayrollItemRepository extends JpaRepository<PayrollItem, UUID> {

    List<PayrollItem> findAllByPayrollId(UUID payrollId);

    List<PayrollItem> findAllByEmployeeId(UUID employeeId);
}