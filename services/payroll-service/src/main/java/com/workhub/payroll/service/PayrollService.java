package com.workhub.payroll.service;

import com.workhub.payroll.client.EmployeeClient;
import com.workhub.payroll.domain.*;
import com.workhub.payroll.repo.*;
import com.workhub.payroll.kafka.producer.PayrollEventsPublisher;
import com.workhub.payroll.kafka.event.PayrollGeneratedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepo;
    private final PayrollItemRepository itemRepo;
    private final PayrollParameterRepository paramsRepo;
    private final EmployeeClient employeeClient;
    private final PayrollEngine engine;
    private final PayrollEventsPublisher eventsPublisher;

    @Transactional
    public Payroll generateMonthlyPayroll(UUID orgId, int month, int year, UUID requestedBy) {
        // Vérifier si la paie existe déjà
        if (payrollRepo.existsByOrganizationIdAndYearAndMonth(orgId, year, month)) {
            throw new RuntimeException("La paie pour cette période existe déjà.");
        }

        // Récupérer les paramètres (Taux CNSS/AMO, Brackets IR)
        PayrollParameter params = paramsRepo.findFirstByOrganizationIdAndActiveTrueOrderByEffectiveDateDesc(orgId)
                .orElseThrow(() -> new RuntimeException("Paramètres de paie non configurés."));

        // Récupérer les employés du service Employee
        List<EmployeeClient.EmployeeResponse> employees;
        try {
            employees = employeeClient.getActiveEmployees(orgId).getContent();
        } catch (Exception e) {
            log.warn(" Le service employé a planté ! Utilisation d'un employé FICTIF pour tester le moteur de paie.");

            // Création d'un faux employé avec 10 000 MAD de salaire et 2 enfants
            EmployeeClient.EmployeeResponse fakeEmp = new EmployeeClient.EmployeeResponse();
            fakeEmp.setId(UUID.randomUUID());
            fakeEmp.setFirstName("Faux");
            fakeEmp.setLastName("Employé");
            fakeEmp.setBaseSalary(new BigDecimal("10000.00"));
            fakeEmp.setChildrenCount(2);

            employees = List.of(fakeEmp);
        }
        if (employees == null || employees.isEmpty()) {
            throw new RuntimeException("Aucun employé actif trouvé pour cette organisation.");
        }
        Payroll payroll = Payroll.builder()
                .organizationId(orgId)
                .month(month)
                .year(year)
                .status(PayrollStatus.DRAFT)
                .generatedBy(requestedBy)
                .totalGrossSalary(BigDecimal.ZERO)
                .totalNetSalary(BigDecimal.ZERO)
                .build();

        payroll = payrollRepo.save(payroll);

        BigDecimal grandTotalGross = BigDecimal.ZERO;
        BigDecimal grandTotalNet = BigDecimal.ZERO;

        for (EmployeeClient.EmployeeResponse emp : employees) {
            // Sécurité : si la base n'a pas de salaire, on met 0 par défaut pour éviter les plantages
            BigDecimal baseSalary = emp.getBaseSalary() != null ? emp.getBaseSalary() : BigDecimal.ZERO;

            // Sécurité : si pas d'enfants, on met 0
            int children = emp.getChildrenCount() != null ? emp.getChildrenCount() : 0;

            // Appel de ton Moteur de calcul (PayrollEngine)
            PayrollEngine.CalculationResult result = engine.calculate(baseSalary, BigDecimal.ZERO, params, children);

            // Préparation de l'enregistrement en base
            PayrollItem item = new PayrollItem();
            item.setPayroll(payroll);
            item.setEmployeeId(emp.getId());
            item.setBaseSalary(baseSalary);
            item.setGrossSalary(result.gross());
            item.setNetSalary(result.net());
            item.setCnssDeduction(result.cnss());
            item.setAmoDeduction(result.amo());
            item.setTaxableIncome(result.taxable());
            item.setIrDeduction(result.ir());

            // Sauvegarde du bulletin individuel
            itemRepo.save(item);

            // Mise à jour des totaux de l'organisation
            grandTotalGross = grandTotalGross.add(result.gross());
            grandTotalNet = grandTotalNet.add(result.net());
        }

        payroll.setTotalGrossSalary(grandTotalGross);
        payroll.setTotalNetSalary(grandTotalNet);

        // Notification Kafka
        eventsPublisher.sendPayrollGenerated(new PayrollGeneratedEvent(
                payroll.getId(), orgId, String.valueOf(month), year, grandTotalNet, employees.size(), requestedBy.toString(), payroll.getGeneratedAt()
        ));

        return payrollRepo.save(payroll);
    }

    public List<Payroll> getPayrollsByOrganization(UUID orgId) {
        log.info("Fetching sorted payroll history for organization: {}", orgId);
        return payrollRepo.findByOrganizationIdOrderByYearDescMonthDesc(orgId);
    }}