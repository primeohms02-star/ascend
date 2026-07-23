import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { updateOpportunityStatus } from "@/lib/atlas/opportunities/memory";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { opportunityId, status } = await request.json();

    await updateOpportunityStatus(
      userId,
      opportunityId,
      status
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Update Opportunity Status Error:", error);

    return NextResponse.json(
      {
        error: "Failed to update opportunity status",
      },
      {
        status: 500,
      }
    );
  }
}