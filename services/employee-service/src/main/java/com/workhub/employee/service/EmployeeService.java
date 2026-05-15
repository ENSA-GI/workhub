package com.workhub.employee.service;

import com.workhub.employee.domain.*;
import com.workhub.employee.dto.*;
import com.workhub.employee.exception.EmployeeNotFoundException;
import com.workhub.employee.exception.BusinessRuleException;
import com.workhub.employee.kafka.EmployeeEventsPublisher;
import com.workhub.employee.repo.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeArchiveRepository archiveRepository;
    private final SalaryHistoryRepository salaryHistoryRepository;
    private final PositionHistoryRepository positionHistoryRepository;
    private final EmployeeEventsPublisher eventsPublisher;

    @Transactional
    public EmployeeResponse createEmployee(CreateEmployeeRequest request, UUID createdBy) {
        log.info("Creating employee for org {} user {}", request.getOrganizationId(), request.getUserId());

        // Validations métier
        validateCreateRequest(request);

        Employee employee = Employee.builder()
                .organizationId(request.getOrganizationId())
                .userId(request.getUserId())
                .cin(request.getCin())
                .birthDate(request.getBirthDate())
                .birthPlace(request.getBirthPlace())
                .address(request.getAddress())
                .city(request.getCity())
                .postalCode(request.getPostalCode())
                .personalPhone(request.getPersonalPhone())
                .personalEmail(request.getPersonalEmail())
                .maritalStatus(request.getMaritalStatus())
                .childrenCount(request.getChildrenCount())
                .hireDate(request.getHireDate())
                .contractType(request.getContractType())
                .contractEndDate(request.getContractEndDate())
                .departmentId(request.getDepartmentId())
                .positionId(request.getPositionId())
                .category(request.getCategory())
                .baseSalary(request.getBaseSalary())
                .transportBonus(request.getTransportBonus())
                .mealBonus(request.getMealBonus())
                .cnssNumber(request.getCnssNumber())
                .amoNumber(request.getAmoNumber())
                .bankName(request.getBankName())
                .bankAccount(request.getBankAccount())
                .status(EmployeeStatus.ACTIVE)
                .createdBy(createdBy)
                .build();

        employee = employeeRepository.save(employee);
        log.info("Employee created with ID {}", employee.getId());

        // Publier événement Kafka
        eventsPublisher.publishEmployeeCreated(employee);

        return toResponse(employee);
    }

    @Transactional
    public EmployeeResponse updateEmployee(UUID employeeId, UUID organizationId, UpdateEmployeeRequest request, UUID updatedBy) {
        log.info("Updating employee {} for org {}", employeeId, organizationId);

        Employee employee = employeeRepository.findByIdAndOrganizationId(employeeId, organizationId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));

        if (employee.getStatus() == EmployeeStatus.ARCHIVED) {
            throw new BusinessRuleException("Impossible de modifier un employé archivé");
        }

        boolean salaryChanged = false;
        boolean positionChanged = false;

        // Mise à jour infos personnelles
        if (request.getAddress() != null) employee.setAddress(request.getAddress());
        if (request.getCity() != null) employee.setCity(request.getCity());
        if (request.getPostalCode() != null) employee.setPostalCode(request.getPostalCode());
        if (request.getPersonalPhone() != null) employee.setPersonalPhone(request.getPersonalPhone());
        if (request.getPersonalEmail() != null) {
            validateEmailUniqueness(organizationId, request.getPersonalEmail(), employeeId);
            employee.setPersonalEmail(request.getPersonalEmail());
        }
        if (request.getMaritalStatus() != null) employee.setMaritalStatus(request.getMaritalStatus());
        if (request.getChildrenCount() != null) employee.setChildrenCount(request.getChildrenCount());

        // Salaire (avec historique)
        if (request.getBaseSalary() != null && !request.getBaseSalary().equals(employee.getBaseSalary())) {
            salaryChanged = true;
            SalaryHistory history = SalaryHistory.builder()
                    .employeeId(employee.getId())
                    .oldBaseSalary(employee.getBaseSalary())
                    .newBaseSalary(request.getBaseSalary())
                    .oldTransportBonus(employee.getTransportBonus())
                    .newTransportBonus(request.getTransportBonus() != null ? request.getTransportBonus() : employee.getTransportBonus())
                    .oldMealBonus(employee.getMealBonus())
                    .newMealBonus(request.getMealBonus() != null ? request.getMealBonus() : employee.getMealBonus())
                    .reason(request.getChangeReason() != null ? request.getChangeReason() : "Mise à jour salaire")
                    .effectiveDate(LocalDate.now())
                    .changedBy(updatedBy)
                    .build();
            salaryHistoryRepository.save(history);

            employee.setBaseSalary(request.getBaseSalary());
        }

        if (request.getTransportBonus() != null) employee.setTransportBonus(request.getTransportBonus());
        if (request.getMealBonus() != null) employee.setMealBonus(request.getMealBonus());

        // Position/département (avec historique)
        if ((request.getDepartmentId() != null && !request.getDepartmentId().equals(employee.getDepartmentId())) ||
                (request.getPositionId() != null && !request.getPositionId().equals(employee.getPositionId()))) {
            positionChanged = true;
            PositionHistory history = PositionHistory.builder()
                    .employeeId(employee.getId())
                    .oldDepartmentId(employee.getDepartmentId())
                    .newDepartmentId(request.getDepartmentId() != null ? request.getDepartmentId() : employee.getDepartmentId())
                    .oldPositionId(employee.getPositionId())
                    .newPositionId(request.getPositionId() != null ? request.getPositionId() : employee.getPositionId())
                    .reason(request.getChangeReason() != null ? request.getChangeReason() : "Mise à jour poste")
                    .effectiveDate(LocalDate.now())
                    .changedBy(updatedBy)
                    .build();
            positionHistoryRepository.save(history);

            if (request.getDepartmentId() != null) employee.setDepartmentId(request.getDepartmentId());
            if (request.getPositionId() != null) employee.setPositionId(request.getPositionId());
        }

        if (request.getCategory() != null) employee.setCategory(request.getCategory());
        if (request.getCnssNumber() != null) employee.setCnssNumber(request.getCnssNumber());
        if (request.getAmoNumber() != null) employee.setAmoNumber(request.getAmoNumber());
        if (request.getBankName() != null) employee.setBankName(request.getBankName());
        if (request.getBankAccount() != null) employee.setBankAccount(request.getBankAccount());

        employee.setUpdatedBy(updatedBy);
        employee = employeeRepository.save(employee);

        log.info("Employee {} updated (salary: {}, position: {})", employeeId, salaryChanged, positionChanged);
        return toResponse(employee);
    }

    @Transactional
    public void archiveEmployee(UUID employeeId, UUID organizationId, ArchiveEmployeeRequest request, UUID archivedBy) {
        log.info("Archiving employee {} for org {}", employeeId, organizationId);

        Employee employee = employeeRepository.findByIdAndOrganizationId(employeeId, organizationId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));

        if (employee.getStatus() == EmployeeStatus.ARCHIVED) {
            throw new BusinessRuleException("Employé déjà archivé");
        }

        // Archivage
        employee.setStatus(EmployeeStatus.ARCHIVED);
        employee.setUpdatedBy(archivedBy);
        employeeRepository.save(employee);

        // Enregistrement archive
        EmployeeArchive archive = EmployeeArchive.builder()
                .employeeId(employee.getId())
                .departureReason(request.getDepartureReason())
                .departureDate(request.getDepartureDate())
                .comments(request.getComments())
                .finalSettlementAmount(request.getFinalSettlementAmount())
                .archivedBy(archivedBy)
                .build();
        archiveRepository.save(archive);

        log.info("Employee {} archived successfully", employeeId);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployee(UUID employeeId, UUID organizationId) {
        Employee employee = employeeRepository.findByIdAndOrganizationId(employeeId, organizationId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));
        return toResponse(employee);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> listEmployees(UUID organizationId, EmployeeStatus status, Pageable pageable) {
        return employeeRepository.findByOrganizationIdAndStatus(organizationId, status, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> searchEmployees(UUID organizationId, String search, EmployeeStatus status, Pageable pageable) {
        return employeeRepository.searchEmployees(organizationId, status, search, pageable)
                .map(this::toResponse);
    }

    // Validations

    private void validateCreateRequest(CreateEmployeeRequest request) {
        // CIN unique par org
        if (employeeRepository.existsByOrganizationIdAndCin(request.getOrganizationId(), request.getCin())) {
            throw new BusinessRuleException("CIN déjà utilisé dans cette organisation");
        }

        // Email unique par org
        if (employeeRepository.existsByOrganizationIdAndPersonalEmail(request.getOrganizationId(), request.getPersonalEmail())) {
            throw new BusinessRuleException("Email déjà utilisé dans cette organisation");
        }

        // Règle contrat
        if (request.getContractType() == ContractType.CDI && request.getContractEndDate() != null) {
            throw new BusinessRuleException("CDI ne doit pas avoir de date de fin");
        }
        if (request.getContractType() != ContractType.CDI && request.getContractEndDate() == null) {
            throw new BusinessRuleException("CDD/Stage doit avoir une date de fin");
        }

        // Date embauche <= aujourd'hui
        if (request.getHireDate().isAfter(LocalDate.now())) {
            throw new BusinessRuleException("Date d'embauche ne peut être future");
        }
    }

    private void validateEmailUniqueness(UUID orgId, String email, UUID excludeEmployeeId) {
        employeeRepository.findByOrganizationIdAndStatus(orgId, EmployeeStatus.ACTIVE)
                .stream()
                .filter(e -> !e.getId().equals(excludeEmployeeId))
                .filter(e -> email.equalsIgnoreCase(e.getPersonalEmail()))
                .findFirst()
                .ifPresent(e -> {
                    throw new BusinessRuleException("Email déjà utilisé par un autre employé");
                });
    }

    private EmployeeResponse toResponse(Employee e) {
        return EmployeeResponse.builder()
                .id(e.getId())
                .organizationId(e.getOrganizationId())
                .userId(e.getUserId())
                .cin(e.getCin())
                .birthDate(e.getBirthDate())
                .birthPlace(e.getBirthPlace())
                .address(e.getAddress())
                .city(e.getCity())
                .postalCode(e.getPostalCode())
                .personalPhone(e.getPersonalPhone())
                .personalEmail(e.getPersonalEmail())
                .maritalStatus(e.getMaritalStatus())
                .childrenCount(e.getChildrenCount())
                .hireDate(e.getHireDate())
                .contractType(e.getContractType())
                .contractEndDate(e.getContractEndDate())
                .departmentId(e.getDepartmentId())
                .positionId(e.getPositionId())
                .category(e.getCategory())
                .baseSalary(e.getBaseSalary())
                .transportBonus(e.getTransportBonus())
                .mealBonus(e.getMealBonus())
                .cnssNumber(e.getCnssNumber())
                .amoNumber(e.getAmoNumber())
                .bankName(e.getBankName())
                .bankAccount(e.getBankAccount())
                .status(e.getStatus())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}