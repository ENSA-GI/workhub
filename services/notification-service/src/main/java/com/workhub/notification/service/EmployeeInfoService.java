package com.workhub.notification.service;

import com.workhub.notification.client.EmployeeServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeInfoService {

    private final EmployeeServiceClient employeeServiceClient;

    @Value("${employee.default-approver-name:Gestionnaire RH}")
    private String defaultApproverName;

    /**
     * Récupère l'email de l'employé
     */
    public String getEmployeeEmail(UUID employeeId) {
        try {
            EmployeeServiceClient.EmployeeDto employee = employeeServiceClient.getEmployee(employeeId);
            if (employee != null && employee.getPersonalEmail() != null) {
                return employee.getPersonalEmail();
            }
            log.warn("Pas d'email trouvé pour l'employé {}", employeeId);
            return null;
        } catch (Exception e) {
            log.error("Erreur lors de la récupération de l'email pour l'employé {}: {}", employeeId, e.getMessage());
            return null;
        }
    }

    /**
     * Récupère les détails complets de l'employé
     */
    public EmployeeServiceClient.EmployeeDto getEmployeeDetails(UUID employeeId) {
        try {
            return employeeServiceClient.getEmployee(employeeId);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des détails de l'employé {}: {}", employeeId, e.getMessage());
            return null;
        }
    }

    /**
     * Récupère le nom de l'employé approbateur
     */
    public String getApproverName(UUID approverId) {
        try {
            EmployeeServiceClient.EmployeeDto approver = employeeServiceClient.getEmployee(approverId);
            if (approver != null && approver.getCin() != null) {
                return approver.getCin();
            }
            return defaultApproverName;
        } catch (Exception e) {
            log.debug("Erreur lors de la récupération du nom de l'approbateur {}: {}", approverId, e.getMessage());
            return defaultApproverName;
        }
    }
}
