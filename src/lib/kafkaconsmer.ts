// kafkaconsumer.ts
import { Kafka, logLevel } from "kafkajs";

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER || ""],
  ssl: true,
  sasl: {
    mechanism: "scram-sha-256",
    username: process.env.KAFKA_USERNAME || "",
    password: process.env.KAFKA_PASSWORD || "",
  },
  logLevel: logLevel.ERROR,
});

const consumer = kafka.consumer({ groupId: "kafka-tracking-group" });

export const consumeMessages = async (
  topic: string,
  messageHandler: (message: string) => Promise<void>
): Promise<void> => {
  console.log("topic", topic);
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const messageValue = message.value?.toString();
      console.log("messageValue", messageValue);
      if (messageValue) {
        await messageHandler(messageValue);
      }
      //   console.log({
      //     partition,
      //     offset: message.offset,
      //     value: message.value?.toString() || "",
      //   });
    },
  });
};
