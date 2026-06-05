package com.workhub.notification.client;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmployeeServiceClient {

    private final RestTemplate restTemplate;

    @Value("${employee-service.url:http://localhost:8082}")
    private String employeeServiceUrl;

    @Value("${employee.organization-id:00000000-0000-0000-0000-000000000000}")
    private String organizationId;

    public EmployeeDto getEmployee(UUID employeeId) {
        try {
            String url = employeeServiceUrl + "/api/employees/" + employeeId + "?organizationId=" + organizationId;
            log.debug("Appel au service employé: {}", url);
            return restTemplate.getForObject(url, EmployeeDto.class);
        } catch (RestClientException e) {
            log.error("Erreur lors de la récupération des données employé {}: {}", employeeId, e.getMessage());
            return null;
        }
    }

    @Data
    public static class EmployeeDto {
        private UUID id;
        private String personalEmail;
        private String personalPhone;
        private String cin;
        private String address;
        private String city;
        
        // Getters
        public UUID getId() {
            return id;
        }

        public String getPersonalEmail() {
            return personalEmail;
        }

        public String getPersonalPhone() {
            return personalPhone;
        }

        public String getCin() {
            return cin;
        }

        public String getAddress() {
            return address;
        }

        public String getCity() {
            return city;
        }
    }
}

