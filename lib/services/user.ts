import {
  auth,
} from "@clerk/nextjs/server";

import { redirect } from "next/navigation";

import { getProfile } from "@/lib/supabase/profiles";
import { getMemory } from "@/lib/supabase/memory";
import { getMissions } from "@/lib/supabase/missions";
import { getReflections } from "@/lib/supabase/reflections";

import { createProfile } from "@/lib/supabase/createProfile";
import { createMemory } from "@/lib/supabase/createMemory";
import { createMission } from "@/lib/supabase/createMission";

import { getIdentity } from "@/lib/supabase/atlasIdentity";
import { getProgress } from "@/lib/supabase/atlasProgress";

import { analyzePatterns } from "@/lib/atlas/patterns";
import { buildAdaptiveState } from "@/lib/atlas/adaptive";
import { buildAdaptiveMission } from "@/lib/atlas/adaptiveMission";
import { buildAdaptiveOracle } from "@/lib/atlas/adaptiveOracle";
import { rankOpportunities } from "@/lib/atlas/opportunityRanking";
import { buildPrediction } from "@/lib/atlas/predictive";
import { buildWeeklyReview } from "@/lib/atlas/weeklyReview";
import { buildFutureSelf } from "@/lib/atlas/futureSelf";
import { buildDailyBriefing } from "@/lib/atlas/dailyBriefing";
import { calculateAscension } from "@/lib/atlas/ascension";

export async function getCurrentUserBrain() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const clerkId = userId;

  /*
   * Core profile
   */

  let profile = await getProfile(clerkId);

  if (!profile) {
    profile = await createProfile(clerkId);
  }

  /*
   * Long-term memory
   */

  let memory = await getMemory(clerkId);

  if (!memory) {
    memory = await createMemory(clerkId);
  }

  /*
   * Missions
   */

  let missions = await getMissions(clerkId);

  if (missions.length === 0) {
    await createMission(clerkId);

    missions = await getMissions(clerkId);
  }

  /*
   * Canonical progression
   */

  const progress = await getProgress(clerkId);

  const ascension = calculateAscension(
    Number(progress.ascension_score ?? 0)
  );

  /*
   * Identity uses the same progression level.
   * The stored identity can provide a custom title,
   * but it no longer controls the level.
   */

  const identityRecord =
    await getIdentity(clerkId);

  const identity = {
  title:
    identityRecord?.identity_title ??
    ascension.title,

  level: ascension.level,

  /*
   * These identity dimensions are not stored in
   * atlas_identity yet, so they remain neutral until
   * that system is implemented.
   */
  discipline: 0,
  execution: 0,
  learning: 0,
  leadership: 0,

  confidence:
    identityRecord?.confidence ?? 0,

  badges: [],
};

  /*
   * Reflection intelligence
   */

  const reflections =
    await getReflections(clerkId);

  const patterns = analyzePatterns(
    reflections.map((reflection) => ({
      reflection:
        reflection.reflection ?? "",

      mood:
        reflection.mood ?? 3,
    }))
  );

  const adaptive =
    buildAdaptiveState(patterns);

  const adaptiveMission =
    buildAdaptiveMission(adaptive);

  const adaptiveOracle =
    buildAdaptiveOracle(adaptive);

  const currentStreak = Number(
    memory?.current_streak ?? 0
  );

  const prediction = buildPrediction(
    patterns,
    currentStreak
  );

  const weeklyReview = buildWeeklyReview(
    patterns,
    currentStreak
  );

  const journey =
    profile?.journey ??
    "Purpose Discovery";

  const northStar =
    profile?.north_star ??
    "Discover your purpose";

  const brain = {
    journey,
    northStar,

    progress: ascension.score,

    momentum:
      `Level ${ascension.level}`,

    momentumMessage:
      "Keep moving toward your North Star.",
  };

  return {
    profile,

    identity,

    /*
     * Both names remain available while older
     * ASCEND components are being migrated.
     */
    atlasProgress: progress,
    ascension,

    memory,
    missions,
    reflections,

    patterns,
    adaptive,
    adaptiveMission,
    adaptiveOracle,

    prediction,
    weeklyReview,

    futureSelf: buildFutureSelf(
      patterns,
      currentStreak,
      ascension.score
    ),

    dailyBriefing: buildDailyBriefing({
      journey,
      northStar,

      missionTitle:
        adaptiveMission.title,

      progress:
        ascension.score,
    }),

    opportunities: rankOpportunities(
      [],
      adaptive
    ),

    /*
     * Dashboard recommendations will now be
     * constructed from live mission state inside
     * getAtlasDashboard().
     */
    recommendations: [],

    missionTitle:
      adaptiveMission.title,

    ...brain,
  };
}