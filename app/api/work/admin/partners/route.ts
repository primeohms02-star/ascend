import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAscendWorkAdmin } from "@/lib/ascend-work/admin-auth";
import { confirmPartnerMission, convertPartnerToDraft, listPartnerLeads, partnerStages, preparePartnerOutreach, updatePartnerLead } from "@/lib/ascend-work/partners";

const updateSchema = z.object({ id: z.string().uuid(), stage: z.enum(partnerStages), adminNotes: z.string().trim().max(4000).optional() });
const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("prepare_outreach"), id: z.string().uuid() }),
  z.object({ action: z.literal("confirm"), id: z.string().uuid(), fundingAmountMinor: z.number().int().positive(), currency: z.string().regex(/^[A-Z]{3}$/), estimatedHours: z.string().trim().min(1).max(40), expectedDeliverables: z.string().trim().min(3).max(3000) }),
  z.object({ action: z.literal("create_draft"), id: z.string().uuid() }),
]);

export async function GET() {
  try { await requireAscendWorkAdmin(); return NextResponse.json({ partners: await listPartnerLeads() }); }
  catch (error) { const message = error instanceof Error ? error.message : ""; return NextResponse.json({ error: message.includes("UNAUTHENTICATED") || message.includes("FORBIDDEN") ? "Unauthorized" : "Partner leads could not be loaded." }, { status: message.includes("UNAUTHENTICATED") ? 401 : message.includes("FORBIDDEN") ? 403 : 500 }); }
}

export async function PATCH(request: Request) {
  try {
    const adminUserId = await requireAscendWorkAdmin();
    const body = await request.json().catch(() => null);
    const action = actionSchema.safeParse(body);
    if (action.success) {
      if (action.data.action === "prepare_outreach") return NextResponse.json({ success: true, partner: await preparePartnerOutreach(action.data.id) });
      if (action.data.action === "confirm") return NextResponse.json({ success: true, partner: await confirmPartnerMission(action.data) });
      return NextResponse.json({ success: true, ...(await convertPartnerToDraft({ id: action.data.id, adminUserId })) });
    }
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid partner update." }, { status: 400 });
    return NextResponse.json({ success: true, partner: await updatePartnerLead(parsed.data.id, parsed.data.stage, parsed.data.adminNotes) });
  } catch (error) { const message = error instanceof Error ? error.message : ""; return NextResponse.json({ error: message.includes("UNAUTHENTICATED") || message.includes("FORBIDDEN") ? "Unauthorized" : "Partner lead could not be updated." }, { status: message.includes("UNAUTHENTICATED") ? 401 : message.includes("FORBIDDEN") ? 403 : 500 }); }
}
