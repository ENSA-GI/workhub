package com.workhub.employee.repo;

import com.workhub.employee.domain.PositionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PositionHistoryRepository extends JpaRepository<PositionHistory, UUID> {
    List<PositionHistory> findByEmployeeIdOrderByEffectiveDateDesc(UUID employeeId);
}