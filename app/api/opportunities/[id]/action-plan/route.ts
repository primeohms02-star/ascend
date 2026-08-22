import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import {
  buildPersonalizedOpportunityActionPlan,
  buildPersonalizedOpportunityDecision,
} from "@/lib/atlas/opportunities/personalized-decision";
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
        { status: 400 }
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
        { error: "The opportunity could not be found from its original ASCEND source." },
        { status: 404 }
      );
    }

    const decision = await buildPersonalizedOpportunityDecision(userId, opportunity);
    const actionPlan = await buildPersonalizedOpportunityActionPlan(decision);

    return NextResponse.json(
      {
        opportunity: decision.opportunity,
        decision: {
          insight: decision.insight,
          matchScore: decision.matchScore,
          qualityScore: decision.qualityScore,
          signals: decision.signals,
        },
        status: decision.status,
        actionPlan,
      },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Personalized Atlas Action Plan API Error:", error);

    return NextResponse.json(
      { error: "Atlas could not build this opportunity action plan right now." },
      { status: 500 }
    );
  }
}
