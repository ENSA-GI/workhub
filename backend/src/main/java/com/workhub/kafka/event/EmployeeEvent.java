package com.workhub.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeEvent {
    private UUID employeeId;
    private String organizationId;
    private String action;       // CREATED, UPDATED, ARCHIVED
    private String employeeName;
    private String email;
}