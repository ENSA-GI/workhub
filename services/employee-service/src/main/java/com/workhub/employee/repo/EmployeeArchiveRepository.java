package com.workhub.employee.repo;

import com.workhub.employee.domain.EmployeeArchive;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface EmployeeArchiveRepository extends JpaRepository<EmployeeArchive, UUID> {
}