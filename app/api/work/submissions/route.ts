import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getUserWorkApplication, saveWorkSubmission } from "@/lib/ascend-work/service";

const applicationIdSchema = z.string().uuid();
const submissionSchema = z.object({
  applicationId: z.string().uuid(),
  responses: z.record(z.string(), z.string().trim().max(5000)),
  studentNote: z.string().trim().max(2000).default(""),
  submit: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = applicationIdSchema.safeParse(request.nextUrl.searchParams.get("applicationId"));
  if (!parsed.success) return NextResponse.json({ error: "Select a valid application." }, { status: 400 });
  try {
    const application = await getUserWorkApplication(userId, parsed.data);
    if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });
    return NextResponse.json({ application });
  } catch (error) {
    console.error("ASCEND Work workspace error:", error);
    return NextResponse.json({ error: "Your workspace could not be loaded." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = submissionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter valid deliverable responses." }, { status: 400 });
  try {
    const submission = await saveWorkSubmission({ userId, ...parsed.data });
    return NextResponse.json({ success: true, submission });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "ASCEND_WORK_APPLICATION_NOT_FOUND" ? 404
      : ["ASCEND_WORK_WORKSPACE_UNAVAILABLE", "ASCEND_WORK_SUBMISSION_LOCKED"].includes(message) ? 409
        : message === "ASCEND_WORK_DELIVERABLES_INCOMPLETE" ? 400 : 500;
    if (status === 500) console.error("ASCEND Work submission save error:", error);
    const publicMessage = message === "ASCEND_WORK_DELIVERABLES_INCOMPLETE" ? "Complete every required deliverable before submitting."
      : message === "ASCEND_WORK_SUBMISSION_LOCKED" ? "This submission is currently locked for review."
        : message === "ASCEND_WORK_WORKSPACE_UNAVAILABLE" ? "Your workspace is not available for this application."
          : message === "ASCEND_WORK_APPLICATION_NOT_FOUND" ? "Application not found."
            : "Your submission could not be saved.";
    return NextResponse.json({ error: publicMessage }, { status });
  }
}
