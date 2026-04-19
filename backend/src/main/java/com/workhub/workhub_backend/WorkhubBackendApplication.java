package com.workhub.workhub_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.workhub"})
public class WorkhubBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(WorkhubBackendApplication.class, args);
	}
}