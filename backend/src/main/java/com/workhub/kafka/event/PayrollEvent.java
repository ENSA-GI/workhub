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
public class PayrollEvent {
    private UUID payrollId;
    private String organizationId;
    private String month;        // ex: "2025-01"
    private String status;       // GENERATED, SENT
    private int employeeCount;
}