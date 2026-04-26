#!/usr/bin/env bash
set -e

BOOTSTRAP="kafka:9092"
KAFKA_TOPICS="/opt/kafka/bin/kafka-topics.sh"

echo "Waiting for Kafka..."
until $KAFKA_TOPICS --bootstrap-server "$BOOTSTRAP" --list >/dev/null 2>&1; do
  sleep 2
done

create_topic () {
  local topic=$1
  $KAFKA_TOPICS --bootstrap-server "$BOOTSTRAP" \
    --create --if-not-exists --topic "$topic" --partitions 1 --replication-factor 1
}

create_topic "workhub.employee.events.v1"
create_topic "workhub.leave.events.v1"
create_topic "workhub.payroll.events.v1"
create_topic "workhub.recruitment.events.v1"
create_topic "workhub.ai.events.v1"
create_topic "workhub.notification.events.v1"

echo "Kafka topics created."
