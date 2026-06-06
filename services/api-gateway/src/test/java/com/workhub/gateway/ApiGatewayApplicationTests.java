package com.workhub.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(
  classes = ApiGatewayApplication.class,
  webEnvironment = SpringBootTest.WebEnvironment.NONE
)
class ApiGatewayApplicationTests {
  @Test void contextLoads() {}
}
