import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@clerk/nextjs/server";

import {
  getOpportunityLibraryCounts,
  getOpportunitiesByCategory,
  type OpportunityLibraryCategory,
} from "@/lib/atlas/opportunities/memory";
import {
  hydrateOpportunityLibraryRecords,
} from "@/lib/atlas/opportunities/library";

const VALID_CATEGORIES: OpportunityLibraryCategory[] = [
  "saved",
  "applied",
  "completed",
];

function isValidCategory(
  value: string | null
): value is OpportunityLibraryCategory {
  return (
    value !== null &&
    VALID_CATEGORIES.includes(
      value as OpportunityLibraryCategory
    )
  );
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

    const category =
      request.nextUrl.searchParams.get("category");

    const counts =
      await getOpportunityLibraryCounts(userId);

    /*
     * Without a category, return only the counts needed
     * by the Opportunity Library cards.
     */
    if (!category) {
      return NextResponse.json({
        counts,
      });
    }

    if (!isValidCategory(category)) {
      return NextResponse.json(
        {
          error: "Invalid library category",
        },
        {
          status: 400,
        }
      );
    }

    const storedOpportunities =
      await getOpportunitiesByCategory(
        userId,
        category
      );

    const opportunities =
      await hydrateOpportunityLibraryRecords(
        userId,
        storedOpportunities
      );

    return NextResponse.json({
      category,
      counts,
      opportunities,
    });
  } catch (error) {
    console.error(
      "Opportunity Library Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Atlas could not load your opportunity library.",
      },
      {
        status: 500,
      }
    );
  }
}
