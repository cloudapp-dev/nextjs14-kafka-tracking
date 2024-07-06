import { NextRequest, NextResponse } from "next/server";
import { Kafka } from "@upstash/kafka";
export const dynamic = "force-dynamic";

const apikey = process.env.API_KEY;

const kafka = new Kafka({
  url: process.env.KAFKA_URL || "",
  username: process.env.KAFKA_USERNAME || "",
  password: process.env.KAFKA_PASSWORD || "",
});

async function sendToPrisma(message: any) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/tracking`,
    {
      method: "POST",
      body: JSON.stringify(message),
      headers: new Headers({
        "Content-Type": "application/json" || "",
        "x-api-key": apikey || "",
      }),
    }
  );

  const data = await response.json();
  const returnData = data?.data;

  // console.log("Return Data", returnData);

  if (response.ok) {
    return NextResponse.json(
      {
        returnData,
      },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { error: "Failed to Post Tracking Data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (request.headers.get("x-api-key") !== apikey) {
    return new NextResponse(
      JSON.stringify({ status: "fail", message: "You are not authorized" }),
      { status: 401 }
    );
  }

  const c = kafka.consumer();

  const messages = await c.consume({
    consumerGroupId: "trackingGroup",
    instanceId: "trackingInstance",
    topics: ["tracking"],
    autoOffsetReset: "earliest",
  });

  messages.forEach(async (message) => {
    const content = message.value;

    const responsePrisma = await sendToPrisma(JSON.parse(content));
    const prismadata = await responsePrisma.json();
    // const prismareturn = prismadata?.returnData;

    // console.log("prismadata", prismareturn);
  });

  if (messages !== null) {
    return NextResponse.json({ messages: messages.length || 0 });
  } else {
    return NextResponse.json(
      { error: "Failed to fetch messages from Kafka Cluster" },
      { status: 500 }
    );
  }
}
