package com.workhub.leave.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Component
public class OrgPolicyClient {

    private final RestClient client;

    public OrgPolicyClient(@Value("${workhub.services.org-url:http://localhost:8081}") String orgBaseUrl) {
        this.client = RestClient.builder().baseUrl(orgBaseUrl).build();
    }

    public int leaveDaysPerYear(UUID orgId) {
        try {
            Map<?, ?> body = client.get()
                    .uri("/internal/orgs/{id}/leave-policy", orgId)
                    .retrieve()
                    .body(Map.class);
            if (body != null && body.get("leavePolicyDaysPerYear") != null) {
                return ((Number) body.get("leavePolicyDaysPerYear")).intValue();
            }
        } catch (Exception ignored) {
        }
        return 22;
    }

    public BigDecimal maxCarryOver(UUID orgId) {
        try {
            Map<?, ?> body = client.get()
                    .uri("/internal/orgs/{id}/leave-policy", orgId)
                    .retrieve()
                    .body(Map.class);
            if (body != null && body.get("leavePolicyMaxCarryOver") != null) {
                return BigDecimal.valueOf(((Number) body.get("leavePolicyMaxCarryOver")).intValue());
            }
        } catch (Exception ignored) {
        }
        return BigDecimal.TEN;
    }
}
