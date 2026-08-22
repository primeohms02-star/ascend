import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { parseOpportunityRouteId } from "@/lib/atlas/opportunities/reference";
import { resolveOpportunityForUser } from "@/lib/atlas/opportunities/service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { opportunityId, snapshotId } = parseOpportunityRouteId(id);
    const source = request.nextUrl.searchParams.get("source")?.trim() ?? "";

    if (!opportunityId || !source) {
      return NextResponse.json(
        { error: "Opportunity ID and source are required." },
        { status: 400 },
      );
    }

    const opportunity = await resolveOpportunityForUser(
      userId,
      opportunityId,
      source,
      snapshotId,
    );

    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(opportunity, {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch (error) {
    console.error("Opportunity detail API Error:", error);

    return NextResponse.json(
      { error: "Atlas could not load this opportunity right now." },
      { status: 500 },
    );
  }
}
