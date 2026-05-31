package com.workhub.leave.repo;

import com.workhub.leave.domain.LeaveRequest;
import com.workhub.leave.domain.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {
    List<LeaveRequest> findByEmployeeId(UUID employeeId);

    // Add these missing methods:
    List<LeaveRequest> findByEmployeeIdOrderByStartDateDesc(UUID employeeId);

    List<LeaveRequest> findAllByOrderByStartDateDesc();

    List<LeaveRequest> findByStatusOrderByStartDateDesc(LeaveStatus status);

    List<LeaveRequest> findByEmployeeIdAndStatus(UUID employeeId, LeaveStatus status);
}
