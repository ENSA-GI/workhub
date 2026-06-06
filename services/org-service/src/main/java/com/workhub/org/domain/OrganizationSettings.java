package com.workhub.org.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "organization_settings")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class OrganizationSettings extends Auditable {

    @Id
    @Column(name = "organization_id")
    private UUID id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @Builder.Default
    @Column(name = "leave_policy_days_per_year")
    private Integer leavePolicyDaysPerYear = 22;

    @Builder.Default
    @Column(name = "leave_policy_max_carry_over")
    private Integer leavePolicyMaxCarryOver = 10;

    @Column(name = "payroll_cnss_rate", precision = 5, scale = 2)
    private BigDecimal payrollCnssRate;

    @Column(name = "payroll_amo_rate", precision = 5, scale = 2)
    private BigDecimal payrollAmoRate;

    @Builder.Default
    @Column(name = "payroll_ir_progressive_scale")
    private Boolean payrollIrProgressiveScale = true;

    @Column(name = "payroll_template_logo_url")
    private String payrollTemplateLogoUrl;

    @Column(name = "payroll_template_legal_mentions", columnDefinition = "TEXT")
    private String payrollTemplateLegalMentions;
}
