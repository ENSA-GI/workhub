package com.workhub.org.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
        name = "positions",
        uniqueConstraints = @UniqueConstraint(
                name = "positions_org_title_unique",
                columnNames = {"organization_id", "title"}
        )
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Position extends Auditable {

    @Id
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(nullable = false)
    private String title;

    private String description;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProfessionalCategory category = ProfessionalCategory.EMPLOYE;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;
}