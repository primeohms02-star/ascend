import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAscendWorkAdmin } from "@/lib/ascend-work/admin-auth";
import { createPaidMission } from "@/lib/ascend-work/service";

const schema = z.object({
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
  status: z.enum(["draft", "review", "published"]).default("draft"),
})
  .refine((value) => new Date(value.applicationDeadline) > new Date(), {
    message: "Application deadline must be in the future.",
  })
  .refine((value) => new Date(value.deliveryDeadline) > new Date(value.applicationDeadline), {
    message: "Delivery deadline must follow the application deadline.",
  });

export async function POST(request: Request) {
  try {
    const adminUserId = await requireAscendWorkAdmin();
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue.path.length ? issue.path.join(".") : "record";
      return NextResponse.json(
        { error: `Invalid Paid Mission record — ${field}: ${issue.message}` },
        { status: 400 },
      );
    }
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
