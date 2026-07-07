import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    console.log("✅ Clerk Webhook Received");
    console.log("Event:", evt.type);
    console.log("User:", evt.data.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook verification failed:", err);

    return NextResponse.json(
      { error: "Invalid webhook" },
      { status: 400 }
    );
  }
}