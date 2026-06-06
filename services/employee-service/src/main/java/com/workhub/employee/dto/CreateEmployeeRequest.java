package com.workhub.employee.dto;

import com.workhub.employee.domain.*;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateEmployeeRequest {

    @NotNull(message = "Organization ID obligatoire")
    private UUID organizationId;

    @NotNull(message = "User ID obligatoire")
    private UUID userId;

    @NotBlank(message = "CIN obligatoire")
    @Size(max = 20)
    private String cin;

    @NotNull(message = "Date de naissance obligatoire")
    @Past(message = "Date de naissance doit être dans le passé")
    private LocalDate birthDate;

    private String birthPlace;
    private String address;
    private String city;
    private String postalCode;

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Téléphone invalide")
    private String personalPhone;

    @Email(message = "Email invalide")
    private String personalEmail;

    private MaritalStatus maritalStatus = MaritalStatus.SINGLE;

    @Min(value = 0, message = "Nombre d'enfants ne peut être négatif")
    private Integer childrenCount = 0;

    @NotNull(message = "Date d'embauche obligatoire")
    @PastOrPresent(message = "Date d'embauche ne peut être future")
    private LocalDate hireDate;

    @NotNull(message = "Type de contrat obligatoire")
    private ContractType contractType;

    private LocalDate contractEndDate;

    @NotNull(message = "Département obligatoire")
    private UUID departmentId;

    @NotNull(message = "Poste obligatoire")
    private UUID positionId;

    @NotNull(message = "Catégorie professionnelle obligatoire")
    private ProfessionalCategory category;

    @NotNull(message = "Salaire de base obligatoire")
    @DecimalMin(value = "3112.00", message = "Salaire minimum SMIG 3112 MAD")
    private BigDecimal baseSalary;

    private BigDecimal transportBonus = BigDecimal.ZERO;
    private BigDecimal mealBonus = BigDecimal.ZERO;

    private String cnssNumber;
    private String amoNumber;
    private String bankName;
    private String bankAccount;
}