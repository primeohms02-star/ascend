import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAscendWorkAdmin } from "@/lib/ascend-work/admin-auth";
import { listProjectApplicationsAdmin, transitionWorkApplicationAdmin } from "@/lib/ascend-work/service";

const projectIdSchema = z.string().uuid();
const transitionSchema = z.object({
  applicationId: z.string().uuid(),
  action: z.enum(["shortlist", "accept", "reject"]),
});

export async function GET(request: NextRequest) {
  try {
    await requireAscendWorkAdmin();
    const parsed = projectIdSchema.safeParse(request.nextUrl.searchParams.get("projectId"));
    if (!parsed.success) return NextResponse.json({ error: "Select a valid Paid Mission." }, { status: 400 });
    const applications = await listProjectApplicationsAdmin(parsed.data);
    return NextResponse.json({ applications });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "ASCEND_WORK_UNAUTHENTICATED" ? 401 : message === "ASCEND_WORK_FORBIDDEN" ? 403 : 500;
    if (status === 500) console.error("ASCEND Work applicant list error:", error);
    return NextResponse.json({ error: status === 500 ? "Applicants could not be loaded." : "Unauthorized" }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const adminUserId = await requireAscendWorkAdmin();
    const parsed = transitionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Enter a valid application update." }, { status: 400 });
    const application = await transitionWorkApplicationAdmin({ adminUserId, ...parsed.data });
    return NextResponse.json({ success: true, application });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "ASCEND_WORK_UNAUTHENTICATED" ? 401
      : message === "ASCEND_WORK_FORBIDDEN" ? 403
        : message === "ASCEND_WORK_APPLICATION_NOT_FOUND" ? 404
          : ["ASCEND_WORK_NO_SLOTS", "ASCEND_WORK_INVALID_TRANSITION"].includes(message) ? 409
            : 500;
    if (status === 500) console.error("ASCEND Work applicant update error:", error);
    const publicMessage = message === "ASCEND_WORK_NO_SLOTS" ? "All available project slots are already filled."
      : message === "ASCEND_WORK_INVALID_TRANSITION" ? "This application changed state. Refresh and try again."
        : message === "ASCEND_WORK_APPLICATION_NOT_FOUND" ? "Application not found."
          : status === 500 ? "Application status could not be updated." : "Unauthorized";
    return NextResponse.json({ error: publicMessage }, { status });
  }
}
