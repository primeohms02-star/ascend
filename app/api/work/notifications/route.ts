import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { markWorkNotificationsRead } from "@/lib/ascend-work/service";

const schema = z.object({ notificationId: z.string().uuid().optional() });

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Select a valid notification." }, { status: 400 });
  try {
    await markWorkNotificationsRead({ userId, ...parsed.data });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ASCEND Work notification update error:", error);
    return NextResponse.json({ error: "Notification could not be updated." }, { status: 500 });
  }
}
