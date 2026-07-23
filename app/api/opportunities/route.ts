import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPersonalizedOpportunities } from "@/lib/atlas/opportunities/service";

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
      await getPersonalizedOpportunities({
        clerkId: userId,
      });

    return NextResponse.json(opportunities);

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    );

  }
}