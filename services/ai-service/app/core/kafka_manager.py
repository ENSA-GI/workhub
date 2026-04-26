import json
import asyncio
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
import os

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9094")
REQUEST_TOPIC = "workhub.recruitment.events.v1"
RESULT_TOPIC = "workhub.ai.events.v1"

async def consume_requests(callback):
    consumer = AIOKafkaConsumer(
        REQUEST_TOPIC,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id="ai-analysis-group",
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )
    await consumer.start()
    try:
        async for msg in consumer:
            print(f"Received request: {msg.value}")
            await callback(msg.value)
    finally:
        await consumer.stop()

async def send_result(result):
    producer = AIOKafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_serializer=lambda x: json.dumps(x).encode('utf-8')
    )
    await producer.start()
    try:
        await producer.send_and_wait(RESULT_TOPIC, result)
        print(f"Sent result: {result}")
    finally:
        await producer.stop()
