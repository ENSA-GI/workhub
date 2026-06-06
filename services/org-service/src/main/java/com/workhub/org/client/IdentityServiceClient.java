package com.workhub.org.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;
import java.util.UUID;

@Component
public class IdentityServiceClient {

    private final WebClient webClient;

    public IdentityServiceClient(@Value("${identity.service.url:http://localhost:8088}") String identityServiceUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(identityServiceUrl)
                .build();
    }

    public UUID createAdminUser(UUID organizationId, String email, String password,
                                  String firstName, String lastName, String phone) {
        try {
            Map<String, Object> request = Map.of(
                    "organizationId", organizationId,
                    "email", email,
                    "password", password,
                    "firstName", firstName != null ? firstName : "",
                    "lastName", lastName != null ? lastName : "",
                    "phone", phone != null ? phone : "",
                    "role", "ORG_ADMIN"
            );

            Map<String, Object> response = webClient.post()
                    .uri("/internal/users/register")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("id")) {
                return UUID.fromString(response.get("id").toString());
            }
            throw new RuntimeException("Failed to create admin user: No ID returned");
        } catch (WebClientResponseException e) {
            throw new RuntimeException("Failed to create admin user: " + e.getResponseBodyAsString(), e);
        }
    }
}
