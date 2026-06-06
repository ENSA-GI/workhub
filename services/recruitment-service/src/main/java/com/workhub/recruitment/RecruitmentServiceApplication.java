package com.workhub.recruitment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class RecruitmentServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(RecruitmentServiceApplication.class, args);
	}

}
