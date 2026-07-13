import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { completeLatestMission } from "@/lib/supabase/atlasMission";
import { completeMission } from "@/lib/atlas/momentum";
import { addAscensionScore } from "@/lib/supabase/atlasProgress";
import { updateStreak } from "@/lib/atlas/streak";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Complete today's mission
  await completeLatestMission(userId);

  // Update momentum
  const momentum = await completeMission(userId);

  // Reward XP
  const progress = await addAscensionScore(
    userId,
    15
  );

  // Update streak
  const streak = await updateStreak(userId);

  return NextResponse.json({
    success: true,
    momentum,
    progress,
    streak,
  });
}