package com.workhub.payroll.repo;

import com.workhub.payroll.domain.PayrollBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayrollBudgetRepository extends JpaRepository<PayrollBudget, UUID> {
    Optional<PayrollBudget> findByOrganizationIdAndBudgetYear(UUID organizationId, Integer budgetYear);
}