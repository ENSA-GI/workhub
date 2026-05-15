package com.workhub.employee.dto;

import com.workhub.employee.domain.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class EmployeeResponse {
    private UUID id;
    private UUID organizationId;
    private UUID userId;
    private String cin;
    private LocalDate birthDate;
    private String birthPlace;
    private String address;
    private String city;
    private String postalCode;
    private String personalPhone;
    private String personalEmail;
    private MaritalStatus maritalStatus;
    private Integer childrenCount;
    private LocalDate hireDate;
    private ContractType contractType;
    private LocalDate contractEndDate;
    private UUID departmentId;
    private UUID positionId;
    private ProfessionalCategory category;
    private BigDecimal baseSalary;
    private BigDecimal transportBonus;
    private BigDecimal mealBonus;
    private String cnssNumber;
    private String amoNumber;
    private String bankName;
    private String bankAccount;
    private EmployeeStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}