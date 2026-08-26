import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { applyForPaidMission } from "@/lib/ascend-work/service";

const applicationSchema = z.object({
  projectId: z.string().uuid(),
  coverNote: z.string().trim().max(1200).default(""),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = applicationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid Paid Mission application." }, { status: 400 });
  }

  try {
    const application = await applyForPaidMission({ userId, ...parsed.data });
    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ASCEND Work could not submit this application.";
    const status = message === "ASCEND_WORK_ACCESS_REQUIRED"
      ? 403
      : message === "ASCEND_WORK_PROJECT_UNAVAILABLE"
        ? 404
        : message === "ASCEND_WORK_ALREADY_APPLIED"
          ? 409
          : 500;
    const publicMessage = message === "ASCEND_WORK_ACCESS_REQUIRED"
      ? "An active ASCEND subscription or sponsored access is required."
      : message === "ASCEND_WORK_PROJECT_UNAVAILABLE"
        ? "This Paid Mission is no longer accepting applications."
        : message === "ASCEND_WORK_ALREADY_APPLIED"
          ? "You already applied for this Paid Mission."
          : "ASCEND Work could not submit this application.";

    if (status === 500) console.error("ASCEND Work application error:", error);
    return NextResponse.json({ error: publicMessage }, { status });
  }
}

