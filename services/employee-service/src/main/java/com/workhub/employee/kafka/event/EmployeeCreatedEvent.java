package com.workhub.employee.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeCreatedEvent {
    private String employeeId;
    private String organizationId;
    private String userId;
    private String hireDate; // ISO format "YYYY-MM-DD"
}