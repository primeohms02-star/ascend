import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAscendWorkAdmin } from "@/lib/ascend-work/admin-auth";
import { createPaidMission, listPaidMissionsAdmin, transitionPaidMission, updatePaidMissionDraft } from "@/lib/ascend-work/service";

const missionFields = z.object({
  organizationId: z.string().uuid(),
  title: z.string().trim().min(4).max(100),
  summary: z.string().trim().min(20).max(320),
  description: z.string().trim().min(40).max(5000),
  category: z.string().trim().min(2).max(80),
  requiredSkills: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  deliverables: z.array(z.string().trim().min(3).max(300)).min(1).max(20),
  paymentAmountMinor: z.number().int().positive().max(100_000_000_00),
  currency: z.string().trim().regex(/^[A-Z]{3}$/).default("NGN"),
  estimatedHours: z.number().int().min(1).max(160),
  availableSlots: z.number().int().min(1).max(100).default(1),
  applicationDeadline: z.string().datetime({ offset: true }),
  deliveryDeadline: z.string().datetime({ offset: true }),
  status: z.literal("draft").default("draft"),
});

const schema = missionFields
  .refine((value) => new Date(value.applicationDeadline) > new Date(), {
    message: "Application deadline must be in the future.",
  })
  .refine((value) => new Date(value.deliveryDeadline) > new Date(value.applicationDeadline), {
    message: "Delivery deadline must follow the application deadline.",
  });

const updateSchema = missionFields
  .omit({ organizationId: true, status: true })
  .extend({
    id: z.string().uuid(),
    action: z.literal("save"),
  })
  .refine((value) => new Date(value.applicationDeadline) > new Date(), {
    message: "Application deadline must be in the future.",
  })
  .refine((value) => new Date(value.deliveryDeadline) > new Date(value.applicationDeadline), {
    message: "Delivery deadline must follow the application deadline.",
  });

const transitionSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["submit_review", "return_draft", "publish"]),
});

function invalidRecord(error: z.ZodError) {
  const issue = error.issues[0];
  const field = issue.path.length ? issue.path.join(".") : "record";
  return NextResponse.json(
    { error: `Invalid Paid Mission record — ${field}: ${issue.message}` },
    { status: 400 },
  );
}

export async function GET() {
  try {
    await requireAscendWorkAdmin();
    const projects = await listPaidMissionsAdmin();
    return NextResponse.json({ projects });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "ASCEND_WORK_UNAUTHENTICATED" ? 401 : message === "ASCEND_WORK_FORBIDDEN" ? 403 : 500;
    if (status === 500) console.error("ASCEND Work project list error:", error);
    return NextResponse.json({ error: status === 500 ? "Paid Missions could not be loaded." : "Unauthorized" }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const adminUserId = await requireAscendWorkAdmin();
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return invalidRecord(parsed.error);
    const project = await createPaidMission({ adminUserId, ...parsed.data });
    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "ASCEND_WORK_UNAUTHENTICATED" ? 401 : message === "ASCEND_WORK_FORBIDDEN" ? 403 : message === "ASCEND_WORK_ORGANIZATION_NOT_VERIFIED" ? 409 : 500;
    if (status === 500) console.error("ASCEND Work project admin error:", error);
    const publicMessage = status === 409 ? "Verify the organisation before publishing this Paid Mission." : status === 500 ? "Paid Mission could not be created." : "Unauthorized";
    return NextResponse.json({ error: publicMessage }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const adminUserId = await requireAscendWorkAdmin();
    const body = await request.json().catch(() => null);
    const action = body && typeof body === "object" && "action" in body ? body.action : null;
    if (action === "save") {
      const parsed = updateSchema.safeParse(body);
      if (!parsed.success) return invalidRecord(parsed.error);
      const project = await updatePaidMissionDraft({ adminUserId, ...parsed.data });
      return NextResponse.json({ success: true, project });
    }
    const parsed = transitionSchema.safeParse(body);
    if (!parsed.success) return invalidRecord(parsed.error);
    const project = await transitionPaidMission({ adminUserId, ...parsed.data });
    return NextResponse.json({ success: true, project });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "ASCEND_WORK_UNAUTHENTICATED" ? 401
      : message === "ASCEND_WORK_FORBIDDEN" ? 403
        : ["ASCEND_WORK_INVALID_TRANSITION", "ASCEND_WORK_DEADLINE_EXPIRED", "ASCEND_WORK_INVALID_DEADLINE", "ASCEND_WORK_ORGANIZATION_NOT_VERIFIED"].includes(message) ? 409
          : 500;
    if (status === 500) console.error("ASCEND Work project management error:", error);
    const publicMessage = message === "ASCEND_WORK_INVALID_TRANSITION" ? "This mission changed state. Refresh and try again."
      : message === "ASCEND_WORK_DEADLINE_EXPIRED" ? "Set a future application deadline before publishing."
        : message === "ASCEND_WORK_INVALID_DEADLINE" ? "Delivery must follow the application deadline."
          : message === "ASCEND_WORK_ORGANIZATION_NOT_VERIFIED" ? "Verify the organisation before publishing this Paid Mission."
            : status === 500 ? "Paid Mission could not be updated." : "Unauthorized";
    return NextResponse.json({ error: publicMessage }, { status });
  }
}
