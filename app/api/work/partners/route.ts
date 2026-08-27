import { NextResponse } from "next/server";
import { z } from "zod";

import { createPartnerLead } from "@/lib/ascend-work/partners";

const schema = z.object({
  organizationName: z.string().trim().min(2).max(140), website: z.union([z.string().trim().url().max(500), z.literal("")]).optional(),
  contactName: z.string().trim().min(2).max(140), contactEmail: z.string().trim().email().max(320), contactRole: z.string().trim().max(140).optional(),
  organizationType: z.enum(["startup", "small_business", "agency", "ngo", "university", "research", "corporate", "other"]),
  taskCategory: z.enum(["research", "data", "content", "design", "marketing", "technology", "operations", "other"]),
  taskSummary: z.string().trim().min(40).max(2000), expectedDeliverables: z.string().trim().max(2000).optional(),
  budgetRange: z.enum(["15000-30000", "30000-50000", "50000-75000", "75000-plus", "needs-guidance"]),
  estimatedHours: z.enum(["5-10", "10-20", "20-40", "not-sure"]), preferredStartDate: z.string().date().optional(),
  studentAudience: z.string().trim().max(500).optional(), fundingConfirmed: z.boolean(), termsAccepted: z.literal(true), websiteField: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Please review the highlighted organisation and mission details." }, { status: 400 });
    const { termsAccepted, websiteField, ...input } = parsed.data;
    void termsAccepted;
    void websiteField;
    const lead = await createPartnerLead({ ...input, website: input.website || null, contactRole: input.contactRole || null, expectedDeliverables: input.expectedDeliverables || null, preferredStartDate: input.preferredStartDate || null, studentAudience: input.studentAudience || null });
    return NextResponse.json({ success: true, reference: `AWP-${lead.id.slice(0, 8).toUpperCase()}` }, { status: 201 });
  } catch (error) {
    console.error("ASCEND Work partner intake error:", error);
    return NextResponse.json({ error: "Your submission could not be recorded. Please try again." }, { status: 500 });
  }
}
