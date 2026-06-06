package com.workhub.employee.repo;

import com.workhub.employee.domain.SalaryHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SalaryHistoryRepository extends JpaRepository<SalaryHistory, UUID> {
    List<SalaryHistory> findByEmployeeIdOrderByEffectiveDateDesc(UUID employeeId);
}