package com.workhub.employee.service;

import com.workhub.employee.domain.ContractType;
import com.workhub.employee.domain.ProfessionalCategory;
import com.workhub.employee.dto.CreateEmployeeRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeeImportService {

    private final EmployeeService employeeService;

    /**
     * CSV: userId,cin,hireDate,contractType,departmentId,positionId,baseSalary
     * Header row optional (skipped if contains "userId").
     */
    public int importFromCsv(UUID organizationId, String csvContent, UUID createdBy) {
        String[] lines = csvContent.split("\\r?\\n");
        int imported = 0;
        for (String line : lines) {
            if (line.isBlank()) continue;
            String[] cols = line.split(",");
            if (cols[0].trim().equalsIgnoreCase("userId")) continue;
            if (cols.length < 7) continue;
            CreateEmployeeRequest req = new CreateEmployeeRequest();
            req.setOrganizationId(organizationId);
            req.setUserId(UUID.fromString(cols[0].trim()));
            req.setCin(cols[1].trim());
            req.setBirthDate(LocalDate.of(1990, 1, 1));
            req.setHireDate(LocalDate.parse(cols[2].trim()));
            req.setContractType(ContractType.valueOf(cols[3].trim()));
            req.setDepartmentId(UUID.fromString(cols[4].trim()));
            req.setPositionId(UUID.fromString(cols[5].trim()));
            req.setCategory(ProfessionalCategory.EMPLOYE);
            req.setBaseSalary(new BigDecimal(cols[6].trim()));
            employeeService.createEmployee(req, createdBy);
            imported++;
        }
        return imported;
    }
}
