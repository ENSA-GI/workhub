package com.workhub.org.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
        name = "departments",
        uniqueConstraints = @UniqueConstraint(
                name = "departments_org_name_unique",
                columnNames = {"organization_id", "name"}
        )
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Department extends Auditable {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "manager_employee_id")
    private UUID managerEmployeeId;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;
}