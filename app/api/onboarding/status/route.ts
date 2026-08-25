import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { loadOnboardingContext } from "@/lib/atlas/onboardingContext";
import { isOnboardingContextComplete } from "@/lib/atlas/onboardingCompletion";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const onboardingContext = await loadOnboardingContext(userId);

    return NextResponse.json(
      { completed: isOnboardingContextComplete(onboardingContext) },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Onboarding Status API Error:", error);

    return NextResponse.json(
      { error: "ASCEND could not verify onboarding status." },
      { status: 503 }
    );
  }
}
