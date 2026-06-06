package com.workhub.employee.exception;

import java.util.UUID;

public class EmployeeNotFoundException extends RuntimeException {
    public EmployeeNotFoundException(UUID id) {
        super("Employé non trouvé : " + id);
    }
}