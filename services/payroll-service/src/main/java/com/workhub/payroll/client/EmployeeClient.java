package com.workhub.payroll.client;

import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@FeignClient(name = "employee-service", url = "${WORKHUB_GATEWAY_EMPLOYEE:http://employee-service:8080}")
public interface EmployeeClient {

    // On utilise la bonne URL et le bon paramètre "organizationId"
    @GetMapping("/api/employees")
    EmployeePageResponse getActiveEmployees(@RequestParam("organizationId") UUID organizationId);

    @GetMapping("/api/employees/{id}")
    EmployeeResponse getEmployeeById(@PathVariable("id") UUID id, @RequestParam("organizationId") UUID organizationId);

    // Comme l'API renvoie une "Page<EmployeeResponse>", les données sont dans un tableau "content"
    @Data
    class EmployeePageResponse {
        private List<EmployeeResponse> content;
    }

    @Data
    class EmployeeResponse {
        private UUID id;
        private String firstName;
        private String lastName;
        private BigDecimal baseSalary;
        private Integer childrenCount;
        private String department;
    }
}