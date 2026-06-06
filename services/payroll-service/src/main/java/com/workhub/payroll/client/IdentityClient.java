package com.workhub.payroll.client;

import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "identity-service", url = "${WORKHUB_GATEWAY_IDENTITY:http://localhost:8088}")
public interface IdentityClient {

    @GetMapping("/api/users/{id}")
    UserResponse getUserById(@PathVariable("id") UUID id);

    @Data
    class UserResponse {
        private UUID id;
        private String firstName;
        private String lastName;
        private String email;
    }
}
