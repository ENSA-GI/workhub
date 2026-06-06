package com.workhub.org.dto;

public record OrgDashboardResponse(
        long activeDepartmentsCount,
        long activePositionsCount
        // In the future, employeeCount and totalPayroll can be injected here by API Gateway
) {}
