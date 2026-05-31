package com.workhub.employee.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "position_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PositionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "old_department_id")
    private UUID oldDepartmentId;

    @Column(name = "new_department_id")
    private UUID newDepartmentId;

    @Column(name = "old_position_id")
    private UUID oldPositionId;

    @Column(name = "new_position_id")
    private UUID newPositionId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @CreationTimestamp
    @Column(name = "changed_at", updatable = false)
    private LocalDateTime changedAt;

    @Column(name = "changed_by", nullable = false)
    private UUID changedBy;
}