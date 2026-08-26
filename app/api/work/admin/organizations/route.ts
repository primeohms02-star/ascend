import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAscendWorkAdmin } from "@/lib/ascend-work/admin-auth";
import { createWorkOrganization, listWorkOrganizationsAdmin } from "@/lib/ascend-work/service";

const schema = z.object({
  name: z.string().trim().min(2).max(140),
  website: z.string().trim().url().max(500).optional(),
  contactName: z.string().trim().max(140).optional(),
  contactEmail: z.string().trim().email().max(320).optional(),
  verificationStatus: z.enum(["pending", "verified"]).default("pending"),
  verificationNotes: z.string().trim().max(2000).optional(),
});

export async function GET() {
  try {
    await requireAscendWorkAdmin();
    const organizations = await listWorkOrganizationsAdmin();
    return NextResponse.json({ organizations });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "ASCEND_WORK_UNAUTHENTICATED" ? 401 : message === "ASCEND_WORK_FORBIDDEN" ? 403 : 500;
    if (status === 500) console.error("ASCEND Work organisation list error:", error);
    return NextResponse.json({ error: status === 500 ? "Organisations could not be loaded." : "Unauthorized" }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const adminUserId = await requireAscendWorkAdmin();
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid organisation record." }, { status: 400 });
    const organization = await createWorkOrganization({ adminUserId, ...parsed.data });
    return NextResponse.json({ success: true, organization }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "ASCEND_WORK_UNAUTHENTICATED" ? 401 : message === "ASCEND_WORK_FORBIDDEN" ? 403 : 500;
    if (status === 500) console.error("ASCEND Work organisation admin error:", error);
    return NextResponse.json({ error: status === 500 ? "Organisation could not be created." : "Unauthorized" }, { status });
  }
}
