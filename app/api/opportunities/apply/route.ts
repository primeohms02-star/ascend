import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@clerk/nextjs/server";

import { saveOpportunity } from "@/lib/atlas/opportunities/memory";
import { updatePreference } from "@/lib/atlas/opportunities/preferences";

import type { Opportunity } from "@/lib/atlas/opportunities/types";

function isValidOpportunity(
  value: unknown
): value is Opportunity {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const opportunity = value as Partial<Opportunity>;

  return (
    typeof opportunity.id === "string" &&
    opportunity.id.trim().length > 0 &&
    typeof opportunity.title === "string" &&
    opportunity.title.trim().length > 0 &&
    typeof opportunity.company === "string" &&
    opportunity.company.trim().length > 0 &&
    typeof opportunity.source === "string" &&
    opportunity.source.trim().length > 0 &&
    Array.isArray(opportunity.tags)
  );
}

export async function POST(
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

    const body = await request.json();

    const opportunity = body.opportunity;

    if (!isValidOpportunity(opportunity)) {
      return NextResponse.json(
        {
          error: "Invalid opportunity data",
        },
        {
          status: 400,
        }
      );
    }

    const { error } = await saveOpportunity(
      userId,
      opportunity,
      "applied"
    );

    if (error) {
      console.error(
        "Save Applied Opportunity Error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Atlas could not record this application.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Applying is a stronger preference signal than saving,
     * so Atlas learns with slightly higher weights.
     */

    if (opportunity.category) {
      await updatePreference(
        userId,
        opportunity.category,
        3
      );
    }

    for (const tag of opportunity.tags) {
      await updatePreference(
        userId,
        tag,
        2
      );
    }

    if (opportunity.remote) {
      await updatePreference(
        userId,
        "Remote",
        2
      );
    }

    return NextResponse.json({
      success: true,
      status: "applied",
    });
  } catch (error) {
    console.error(
      "Apply Opportunity Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to record the application.",
      },
      {
        status: 500,
      }
    );
  }
}