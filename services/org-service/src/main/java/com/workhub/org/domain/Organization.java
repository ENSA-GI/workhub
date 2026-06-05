package com.workhub.org.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "organizations")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Organization extends Auditable {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "legal_name", nullable = false)
    private String legalName;

    private String city;

    private String industry;

    @Builder.Default
    private String country = "Maroc";

    private String email;

    private String phone;

    @Column(name = "tax_id")
    private String taxId;

    @Builder.Default
    private String plan = "FREE";

    @Builder.Default
    @Column(name = "max_employees")
    private Integer maxEmployees = 10;

    @OneToOne(mappedBy = "organization", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private OrganizationSettings settings;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;
}