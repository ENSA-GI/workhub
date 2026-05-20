package com.workhub.payroll.repo;

import com.workhub.payroll.domain.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, UUID> {

    List<Payroll> findByOrganizationIdOrderByYearDescMonthDesc(UUID organizationId);

    List<Payroll> findAllByOrganizationId(UUID organizationId);

    Optional<Payroll> findByOrganizationIdAndYearAndMonth(UUID organizationId, Integer year, Integer month);

    boolean existsByOrganizationIdAndYearAndMonth(UUID organizationId, Integer year, Integer month);
}