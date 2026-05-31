package com.workhub.employee.dto;

import com.workhub.employee.domain.*;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class UpdateEmployeeRequest {

    private String address;
    private String city;
    private String postalCode;

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Téléphone invalide")
    private String personalPhone;

    @Email(message = "Email invalide")
    private String personalEmail;

    private MaritalStatus maritalStatus;

    @Min(value = 0, message = "Nombre d'enfants ne peut être négatif")
    private Integer childrenCount;

    private UUID departmentId;
    private UUID positionId;
    private ProfessionalCategory category;

    @DecimalMin(value = "3112.00", message = "Salaire minimum SMIG 3112 MAD")
    private BigDecimal baseSalary;

    private BigDecimal transportBonus;
    private BigDecimal mealBonus;

    private String cnssNumber;
    private String amoNumber;
    private String bankName;
    private String bankAccount;

    private String changeReason; // Pour salary/position history
}