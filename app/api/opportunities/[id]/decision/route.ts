import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getOpportunityById } from "@/lib/atlas/opportunities/connector";
import { buildPersonalizedOpportunityDecision } from "@/lib/atlas/opportunities/personalized-decision";
import { getPersonalizedOpportunityById } from "@/lib/atlas/opportunities/service";

export const dynamic = "force-dynamic";

const SNAPSHOT_SEPARATOR = "~ascend-snapshot~";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseOpportunityRouteId(value: string) {
  const routeId = value.trim();
  const separatorIndex = routeId.lastIndexOf(SNAPSHOT_SEPARATOR);

  if (separatorIndex <= 0) {
    return {
      opportunityId: routeId,
      snapshotId: "",
    };
  }

  return {
    opportunityId: routeId.slice(0, separatorIndex).trim(),
    snapshotId: routeId
      .slice(separatorIndex + SNAPSHOT_SEPARATOR.length)
      .trim(),
  };
}

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

    const opportunity =
      (await getPersonalizedOpportunityById(
        userId,
        opportunityId,
        source,
        snapshotId,
      )) ?? (await getOpportunityById(opportunityId, source));

    if (!opportunity) {
      return NextResponse.json(
        {
          error:
            "The opportunity could not be found from its original ASCEND source.",
        },
        { status: 404 },
      );
    }

    const decision = await buildPersonalizedOpportunityDecision(
      userId,
      opportunity,
    );

    return NextResponse.json(decision, {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch (error) {
    console.error("Personalized Atlas Decision API Error:", error);

    return NextResponse.json(
      { error: "Atlas could not evaluate this opportunity right now." },
      { status: 500 },
    );
  }
}
