import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAscendWorkAdmin } from "@/lib/ascend-work/admin-auth";
import { listWorkAuditEventsAdmin } from "@/lib/ascend-work/service";

export async function GET(request: NextRequest) {
  try {
    await requireAscendWorkAdmin();
    const parsed = z.string().uuid().safeParse(request.nextUrl.searchParams.get("projectId"));
    if (!parsed.success) return NextResponse.json({ error: "Select a valid Paid Mission." }, { status: 400 });
    return NextResponse.json({ events: await listWorkAuditEventsAdmin(parsed.data) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "ASCEND_WORK_UNAUTHENTICATED" ? 401 : message === "ASCEND_WORK_FORBIDDEN" ? 403 : 500;
    if (status === 500) console.error("ASCEND Work audit history error:", error);
    return NextResponse.json({ error: status === 500 ? "Audit history could not be loaded." : "Unauthorized" }, { status });
  }
}
