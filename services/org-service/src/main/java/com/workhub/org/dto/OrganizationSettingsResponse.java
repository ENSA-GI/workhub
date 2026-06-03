package com.workhub.org.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrganizationSettingsResponse(
        UUID organizationId,
        Integer leavePolicyDaysPerYear,
        Integer leavePolicyMaxCarryOver,
        BigDecimal payrollCnssRate,
        BigDecimal payrollAmoRate,
        Boolean payrollIrProgressiveScale,
        String payrollTemplateLogoUrl,
        String payrollTemplateLegalMentions
) {}
