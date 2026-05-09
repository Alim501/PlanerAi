#!/bin/sh
if [ -n "$KAFKA_CA_CERT" ]; then
  mkdir -p /certs
  echo "$KAFKA_CA_CERT" > /certs/kafka-ca.pem
fi
exec java -Xmx256m -jar app.jar
