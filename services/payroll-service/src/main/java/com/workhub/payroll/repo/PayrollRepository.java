package com.workhub.payroll.repo;

import com.workhub.payroll.domain.Payroll;
import com.workhub.payroll.domain.PayrollStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT p FROM Payroll p WHERE p.organizationId = :orgId " +
            "AND (:year IS NULL OR p.year = :year) " +
            "AND (:month IS NULL OR p.month = :month) " +
            "AND (:status IS NULL OR p.status = :status) " +
            "ORDER BY p.year DESC, p.month DESC")
    List<Payroll> searchPayrolls(
            @Param("orgId") UUID orgId,
            @Param("year") Integer year,
            @Param("month") Integer month,
            @Param("status") PayrollStatus status
    );
}