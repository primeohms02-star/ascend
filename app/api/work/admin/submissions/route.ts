import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAscendWorkAdmin } from "@/lib/ascend-work/admin-auth";
import { listProjectSubmissionsAdmin, reviewWorkSubmissionAdmin } from "@/lib/ascend-work/service";

const projectIdSchema = z.string().uuid();
const reviewSchema = z.object({
  submissionId: z.string().uuid(),
  action: z.enum(["request_revision", "approve"]),
  revisionNote: z.string().trim().max(3000).optional(),
}).superRefine((value, context) => {
  if (value.action === "request_revision" && !value.revisionNote) {
    context.addIssue({ code: "custom", path: ["revisionNote"], message: "Revision guidance is required." });
  }
});

export async function GET(request: NextRequest) {
  try {
    await requireAscendWorkAdmin();
    const parsed = projectIdSchema.safeParse(request.nextUrl.searchParams.get("projectId"));
    if (!parsed.success) return NextResponse.json({ error: "Select a valid Paid Mission." }, { status: 400 });
    return NextResponse.json({ submissions: await listProjectSubmissionsAdmin(parsed.data) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "ASCEND_WORK_UNAUTHENTICATED" ? 401 : message === "ASCEND_WORK_FORBIDDEN" ? 403 : 500;
    if (status === 500) console.error("ASCEND Work submission list error:", error);
    return NextResponse.json({ error: status === 500 ? "Submissions could not be loaded." : "Unauthorized" }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const adminUserId = await requireAscendWorkAdmin();
    const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Enter a valid review." }, { status: 400 });
    const result = await reviewWorkSubmissionAdmin({ adminUserId, ...parsed.data });
    return NextResponse.json({ success: true, submission: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "ASCEND_WORK_UNAUTHENTICATED" ? 401 : message === "ASCEND_WORK_FORBIDDEN" ? 403
      : message === "ASCEND_WORK_SUBMISSION_NOT_FOUND" ? 404
        : message === "ASCEND_WORK_REVISION_NOTE_REQUIRED" ? 400
          : message === "ASCEND_WORK_INVALID_TRANSITION" ? 409 : 500;
    if (status === 500) console.error("ASCEND Work submission review error:", error);
    const publicMessage = message === "ASCEND_WORK_INVALID_TRANSITION" ? "This submission is no longer awaiting review. Refresh and try again."
      : message === "ASCEND_WORK_REVISION_NOTE_REQUIRED" ? "Add clear revision guidance before sending it."
        : message === "ASCEND_WORK_SUBMISSION_NOT_FOUND" ? "Submission not found."
          : status === 500 ? "The review could not be recorded." : "Unauthorized";
    return NextResponse.json({ error: publicMessage }, { status });
  }
}
