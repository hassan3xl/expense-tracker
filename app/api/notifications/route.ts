import { NextResponse } from "next/server";
import { sendQStackNotification } from "@/lib/notification";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, body: messageBody, channel, payload } = body;

    if (!title || !messageBody) {
      return NextResponse.json(
        { error: "Title and body are required for notification" },
        { status: 400 }
      );
    }

    const result = await sendQStackNotification({
      title,
      body: messageBody,
      channel: channel || "admin",
      payload: payload || { environment: "production" },
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal error processing notification" },
      { status: 500 }
    );
  }
}
