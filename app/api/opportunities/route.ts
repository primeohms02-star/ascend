import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@clerk/nextjs/server";

import {
  getPersonalizedOpportunityPage,
} from "@/lib/atlas/opportunities/service";
import { getOpportunityStatuses } from "@/lib/atlas/opportunities/memory";
import type { OpportunityLocationMode } from "@/lib/atlas/opportunities/location";

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

function readTextParameter(
  searchParams: URLSearchParams,
  name: string,
  maxLength = 120,
): string {
  return (searchParams.get(name) ?? "").trim().slice(0, maxLength);
}

function readLocationMode(searchParams: URLSearchParams): OpportunityLocationMode {
  const value = readTextParameter(searchParams, "locationMode", 20);

  if (
    value === "all" ||
    value === "manual" ||
    value === "current" ||
    value === "profile"
  ) {
    return value;
  }

  return "profile";
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

    const location = {
      mode: readLocationMode(searchParams),
      query: readTextParameter(searchParams, "location"),
      city: readTextParameter(searchParams, "city"),
      region: readTextParameter(searchParams, "region"),
      country: readTextParameter(searchParams, "country"),
    };

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
          location,
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
