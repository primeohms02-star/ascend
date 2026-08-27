import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAscendWorkAdmin } from "@/lib/ascend-work/admin-auth";
import { listPartnerLeads, partnerStages, updatePartnerLead } from "@/lib/ascend-work/partners";

const updateSchema = z.object({ id: z.string().uuid(), stage: z.enum(partnerStages), adminNotes: z.string().trim().max(4000).optional() });

export async function GET() {
  try { await requireAscendWorkAdmin(); return NextResponse.json({ partners: await listPartnerLeads() }); }
  catch (error) { const message = error instanceof Error ? error.message : ""; return NextResponse.json({ error: message.includes("UNAUTHENTICATED") || message.includes("FORBIDDEN") ? "Unauthorized" : "Partner leads could not be loaded." }, { status: message.includes("UNAUTHENTICATED") ? 401 : message.includes("FORBIDDEN") ? 403 : 500 }); }
}

export async function PATCH(request: Request) {
  try {
    await requireAscendWorkAdmin();
    const parsed = updateSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid partner update." }, { status: 400 });
    return NextResponse.json({ success: true, partner: await updatePartnerLead(parsed.data.id, parsed.data.stage, parsed.data.adminNotes) });
  } catch (error) { const message = error instanceof Error ? error.message : ""; return NextResponse.json({ error: message.includes("UNAUTHENTICATED") || message.includes("FORBIDDEN") ? "Unauthorized" : "Partner lead could not be updated." }, { status: message.includes("UNAUTHENTICATED") ? 401 : message.includes("FORBIDDEN") ? 403 : 500 }); }
}
