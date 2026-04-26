package com.workhub.leave.repo;

import com.workhub.leave.domain.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LeaveTypeRepository extends JpaRepository<LeaveType, UUID> {
    List<LeaveType> findByOrganizationId(UUID organizationId);
}