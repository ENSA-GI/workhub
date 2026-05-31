package com.workhub.payroll.repo;

import com.workhub.payroll.domain.PayrollParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayrollParameterRepository extends JpaRepository<PayrollParameter, UUID> {
    // On récupère les paramètres actifs pour une organisation
    Optional<PayrollParameter> findFirstByOrganizationIdAndActiveTrueOrderByEffectiveDateDesc(UUID organizationId);
}