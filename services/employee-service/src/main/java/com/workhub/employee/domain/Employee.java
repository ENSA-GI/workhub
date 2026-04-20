package com.workhub.employee.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "employees")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Employee {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String cin;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "birth_place")
    private String birthPlace;

    private String address;
    private String city;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "personal_phone")
    private String personalPhone;

    @Column(name = "personal_email")
    private String personalEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "marital_status")
    private MaritalStatus maritalStatus;

    @Column(name = "children_count")
    private Integer childrenCount;

    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "contract_type", nullable = false)
    private ContractType contractType;

    @Column(name = "contract_end_date")
    private LocalDate contractEndDate;

    @Column(name = "department_id", nullable = false)
    private UUID departmentId;

    @Column(name = "position_id", nullable = false)
    private UUID positionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProfessionalCategory category;

    @Column(name = "base_salary", nullable = false)
    private BigDecimal baseSalary;

    @Column(name = "transport_bonus")
    private BigDecimal transportBonus;

    @Column(name = "meal_bonus")
    private BigDecimal mealBonus;

    @Column(name = "cnss_number")
    private String cnssNumber;

    @Column(name = "amo_number")
    private String amoNumber;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "bank_account")
    private String bankAccount;

    @Enumerated(EnumType.STRING)
    private EmployeeStatus status;
}
