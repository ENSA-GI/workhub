package com.workhub.recruitment.api;

import com.workhub.recruitment.dto.RecruitmentAnalyticsResponse;
import com.workhub.recruitment.service.RecruitmentAnalyticsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
public class RecruitmentAnalyticsController {

    private final RecruitmentAnalyticsService analyticsService;

    public RecruitmentAnalyticsController(RecruitmentAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/recruitment")
    public RecruitmentAnalyticsResponse getRecruitmentAnalytics(@RequestParam UUID organizationId) {
        return analyticsService.getAnalytics(organizationId);
    }
}
