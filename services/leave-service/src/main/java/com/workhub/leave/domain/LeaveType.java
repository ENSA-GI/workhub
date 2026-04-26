package com.workhub.leave.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "leave_types")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class LeaveType {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "requires_certificate", nullable = false)
    private Boolean requiresCertificate = false;

    @Column(name = "is_paid", nullable = false)
    private Boolean isPaid = true;

    @Column(name = "max_days_per_year")
    private Integer maxDaysPerYear;

    @Column(nullable = false)
    private Boolean active = true;
}