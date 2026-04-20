package com.workhub.leave.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "leave_requests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LeaveRequest {

    @Id
    private UUID id;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "leave_type_id", nullable = false)
    private UUID leaveTypeId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "requested_days")
    private BigDecimal requestedDays;

    private String reason;

    @Enumerated(EnumType.STRING)
    private LeaveStatus status;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "review_comment")
    private String reviewComment;
}