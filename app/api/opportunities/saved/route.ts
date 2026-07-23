import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSavedOpportunities } from "@/lib/atlas/opportunities/memory";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const opportunities =
      await getSavedOpportunities(userId);

    return NextResponse.json(opportunities);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load saved opportunities" },
      { status: 500 }
    );
  }
}