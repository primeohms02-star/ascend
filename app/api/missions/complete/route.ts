import { getProfile } from "@/lib/supabase/profiles";
import { getDailyMission } from "@/lib/engine/mission";
import { saveMission } from "@/lib/supabase/atlasMission";
import {
  loadProfile,
  updateProfileProgress,
} from "@/lib/atlas/profile";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { recordMemory } from "@/lib/atlas/recordMemory";
import { completeLatestMission } from "@/lib/supabase/atlasMission";
import { completeMission } from "@/lib/atlas/momentum";
import { addAscensionScore } from "@/lib/supabase/atlasProgress";
import { updateStreak } from "@/lib/atlas/streak";
import { updatePreference } from "@/lib/atlas/opportunities/preferences";


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

const missionProfile = await getProfile(userId);

if (missionProfile) {
await updatePreference(
  userId,
  missionProfile.journey ?? "General Growth",
  3
);
}
  
const profileResult = await loadProfile(userId);

if (profileResult.data) {
  await updateProfileProgress(userId, profileResult.data);
}

  // Update momentum
  const momentum = await completeMission(userId);

  await recordMemory(
  userId,
  "mission",
  "Mission Completed",
  "Completed today's mission and increased momentum.",
  {
    current_streak:
      momentum?.current_streak ?? 0,

    longest_streak:
      momentum?.longest_streak ?? 0,

    ascension_score:
      momentum?.ascension_score ?? 0,

    last_mission_date:
      new Date().toISOString(),
  }
);

  // Reward XP
  const progress = await addAscensionScore(
    userId,
    15
  );

  // Update streak
 const profile = await getProfile(userId);

if (profile) {
  const nextMission = await getDailyMission(
    (profile as any).journey,
    userId
  );

  await saveMission(
    userId,
    nextMission.title,
    nextMission.description
  );
}
  return NextResponse.json({
    success: true,
    momentum,
    progress,
  
  });
}