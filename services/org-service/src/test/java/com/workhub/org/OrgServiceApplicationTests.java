package com.workhub.org;

import com.workhub.org.messaging.KafkaEventPublisher;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class OrgServiceApplicationTests {

	@MockitoBean
	private KafkaEventPublisher kafkaEventPublisher;

	@Test
	void contextLoads() {
	}

}
