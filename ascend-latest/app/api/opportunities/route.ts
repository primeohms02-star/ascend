import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@clerk/nextjs/server";

import {
  getPersonalizedOpportunityPage,
} from "@/lib/atlas/opportunities/service";
import { getOpportunityStatuses } from "@/lib/atlas/opportunities/memory";

export const dynamic = "force-dynamic";

function parsePositiveInteger(
  value: string | null,
  fallback: number
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(
    value,
    10
  );

  if (
    !Number.isFinite(parsed) ||
    parsed < 1
  ) {
    return fallback;
  }

  return parsed;
}

export async function GET(
  request: NextRequest
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const searchParams =
      request.nextUrl.searchParams;

    const page =
      parsePositiveInteger(
        searchParams.get("page"),
        1
      );

    const limit =
      parsePositiveInteger(
        searchParams.get("limit"),
        10
      );

    const search =
      searchParams
        .get("search")
        ?.trim() ?? "";

    const filter =
      searchParams
        .get("filter")
        ?.trim() ?? "All";

    const result =
      await getPersonalizedOpportunityPage(
        {
          clerkId: userId,
        },
        {
          page,
          limit,
          search,
          filter,
        }
      );

    const opportunityStatuses =
      await getOpportunityStatuses(
        userId,
        result.opportunities.map(
          (opportunity) => opportunity.id
        )
      );

    return NextResponse.json(
      { ...result, opportunityStatuses },
      {
        headers: {
          "Cache-Control":
            "private, no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "Opportunity API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch opportunities",
      },
      {
        status: 500,
      }
    );
  }
}
