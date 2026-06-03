package com.workhub.org.dto;

public record OrgDashboardResponse(
        long activeDepartmentsCount,
        long activePositionsCount,
        long employeeCount,
        long rhManagerCount
) {}
