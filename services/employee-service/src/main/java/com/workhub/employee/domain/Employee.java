package com.workhub.employee.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "employees", indexes = {
        @Index(name = "idx_employees_organization", columnList = "organization_id"),
        @Index(name = "idx_employees_user", columnList = "user_id"),
        @Index(name = "idx_employees_status", columnList = "status")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(nullable = false, length = 20)
    private String cin;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "birth_place")
    private String birthPlace;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 100)
    private String city;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "personal_phone", length = 20)
    private String personalPhone;

    @Column(name = "personal_email")
    private String personalEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "marital_status")
    private MaritalStatus maritalStatus;

    @Column(name = "children_count")
    private Integer childrenCount = 0;

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

    @Column(name = "base_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal baseSalary;

    @Column(name = "transport_bonus", precision = 10, scale = 2)
    private BigDecimal transportBonus = BigDecimal.ZERO;

    @Column(name = "meal_bonus", precision = 10, scale = 2)
    private BigDecimal mealBonus = BigDecimal.ZERO;

    @Column(name = "cnss_number", length = 50)
    private String cnssNumber;

    @Column(name = "amo_number", length = 50)
    private String amoNumber;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "bank_account", length = 50)
    private String bankAccount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmployeeStatus status = EmployeeStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;
}