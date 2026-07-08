import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    console.log("✅ Clerk Webhook Received");
    console.log("Event:", evt.type);

    if (evt.type === "user.created") {
      const user = evt.data;

      const { error } = await supabaseAdmin
        .from("profiles")
        .insert({
          clerk_id: user.id,
          full_name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
          email: user.email_addresses[0]?.email_address,
        });

      if (error) {
        console.error("❌ Supabase Error:", error);
      } else {
        console.log("✅ User profile created successfully.");
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook verification failed:", err);

    return NextResponse.json(
      { error: "Invalid webhook" },
      { status: 400 }
    );
  }
}