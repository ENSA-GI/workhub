package com.workhub.org.dto;

import java.math.BigDecimal;

public record UpdateOrganizationSettingsRequest(
        Integer leavePolicyDaysPerYear,
        Integer leavePolicyMaxCarryOver,
        BigDecimal payrollCnssRate,
        BigDecimal payrollAmoRate,
        Boolean payrollIrProgressiveScale,
        String payrollTemplateLogoUrl,
        String payrollTemplateLegalMentions
) {}
