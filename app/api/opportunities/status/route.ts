import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@clerk/nextjs/server";

import {
  removeSavedOpportunity,
  updateOpportunityStatus,
  type OpportunityStatus,
} from "@/lib/atlas/opportunities/memory";

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const opportunityId = request.nextUrl.searchParams
      .get("opportunityId")
      ?.trim();

    if (!opportunityId) {
      return NextResponse.json(
        { error: "A valid opportunity ID is required." },
        { status: 400 }
      );
    }

    const { error } = await removeSavedOpportunity(
      userId,
      opportunityId
    );

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, status: null });
  } catch (error) {
    console.error("Unsave Opportunity API Error:", error);

    return NextResponse.json(
      { error: "Atlas could not unsave this opportunity." },
      { status: 500 }
    );
  }
}

const VALID_STATUSES: OpportunityStatus[] = [
  "saved",
  "applied",
  "interview",
  "completed",
  "accepted",
  "rejected",
  "ignored",
];

function isValidStatus(
  value: unknown
): value is OpportunityStatus {
  return (
    typeof value === "string" &&
    VALID_STATUSES.includes(
      value as OpportunityStatus
    )
  );
}

export async function PATCH(
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

    const opportunityId =
      body.opportunityId;

    const status = body.status;

    if (
      typeof opportunityId !== "string" ||
      opportunityId.trim().length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "A valid opportunity ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidStatus(status)) {
      return NextResponse.json(
        {
          error:
            "A valid opportunity status is required.",
        },
        {
          status: 400,
        }
      );
    }

    const { data, error } =
      await updateOpportunityStatus(
        userId,
        opportunityId,
        status
      );

    if (error) {
      console.error(
        "Update Opportunity Status Error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Atlas could not update this opportunity.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      status,
      opportunity: data,
    });
  } catch (error) {
    console.error(
      "Opportunity Status API Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update the opportunity status.",
      },
      {
        status: 500,
      }
    );
  }
}
