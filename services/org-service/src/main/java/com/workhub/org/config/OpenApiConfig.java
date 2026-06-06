package com.workhub.org.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI orgServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Org Service API")
                        .description("Microservice de gestion des organisations, départements et postes - WorkHub")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("WorkHub Team")));
    }
}
