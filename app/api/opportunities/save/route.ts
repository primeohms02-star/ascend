import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { saveOpportunity } from "@/lib/atlas/opportunities/memory";
import { updatePreference } from "@/lib/atlas/opportunities/preferences";


export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { opportunity } = await request.json();

    await saveOpportunity(
      userId,
      opportunity,
      "saved"
    );

// Teach Atlas from the user's behavior

// Learn from the opportunity category
if (opportunity.category) {
  await updatePreference(
    userId,
    opportunity.category,
    2
  );
}

// Learn from every tag
for (const tag of opportunity.tags ?? []) {
  await updatePreference(
    userId,
    tag,
    1
  );
}

// Learn remote preference
if (opportunity.remote) {
  await updatePreference(
    userId,
    "Remote",
    1
  );
}

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error("Save Opportunity Error:", error);

    return NextResponse.json(
      {
        error: "Failed to save opportunity",
      },
      {
        status: 500,
      }
    );
  }
}