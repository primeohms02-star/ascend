import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAscendWorkAdmin } from "@/lib/ascend-work/admin-auth";
import { grantWorkAccess } from "@/lib/ascend-work/service";

const schema = z.object({
  userId: z.string().trim().min(3).max(200),
  source: z.enum(["individual", "university", "corporate", "foundation", "pilot"]),
  sponsorName: z.string().trim().max(180).optional(),
  startsAt: z.string().datetime({ offset: true }).optional(),
  endsAt: z.string().datetime({ offset: true }).optional(),
}).refine((value) => !value.endsAt || new Date(value.endsAt) > new Date(value.startsAt ?? Date.now()), {
  message: "Access end must follow its start.",
});

export async function POST(request: Request) {
  try {
    const adminUserId = await requireAscendWorkAdmin();
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid access grant." }, { status: 400 });
    const grant = await grantWorkAccess({ adminUserId, ...parsed.data });
    return NextResponse.json({ success: true, grant }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "ASCEND_WORK_UNAUTHENTICATED" ? 401 : message === "ASCEND_WORK_FORBIDDEN" ? 403 : 500;
    if (status === 500) console.error("ASCEND Work access admin error:", error);
    return NextResponse.json({ error: status === 500 ? "Access could not be granted." : "Unauthorized" }, { status });
  }
}
