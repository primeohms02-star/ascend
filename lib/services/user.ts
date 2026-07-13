import { auth } from "@clerk/nextjs/server";
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

import { buildBrainContext } from "@/lib/brain/context";

export async function getCurrentUserBrain() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Profile
  let profile = await getProfile(userId);

  if (!profile) {
    profile = await createProfile(userId);
  }

  // Memory
  let memory = await getMemory(userId);

  if (!memory) {
    memory = await createMemory(userId);
  }

  // Missions
  let missions = await getMissions(userId);

  if (missions.length === 0) {
    await createMission(userId);
    missions = await getMissions(userId);
  }

  // Identity
  const identity = await getIdentity(userId);

  // Progress
  const progress = await getProgress(userId);

  // Reflections
  const reflections = await getReflections(userId);

  // Pattern Recognition
  const patterns = analyzePatterns(reflections);

  // Adaptive Intelligence
  const adaptive = buildAdaptiveState(patterns);

  const adaptiveMission =
    buildAdaptiveMission(adaptive);

  const adaptiveOracle =
    buildAdaptiveOracle(adaptive);

  // Prediction
  const prediction =
    buildPrediction(
      patterns,
      memory.current_streak ?? 0
    );

  // Weekly Review
  const weeklyReview =
    buildWeeklyReview(
      patterns,
      memory.current_streak ?? 0
    );

  const firstAnswer =
    profile?.journey ??
    "I'm Not Sure Yet";

  const brain =
    buildBrainContext(
      firstAnswer,
      adaptiveMission
    );

  // Daily Briefing
  const dailyBriefing =
    buildDailyBriefing(brain);

  // Ranked Opportunities
  const rankedOpportunities =
    rankOpportunities(
      brain.opportunities,
      adaptive
    );

  // Future Self
  const futureSelf =
    buildFutureSelf(
      patterns,
      memory.current_streak ?? 0,
      brain.progress
    );

  return {
    ...brain,

    opportunities: rankedOpportunities,

    profile,
    memory,
    missions,

    identity,

    atlasProgress: progress,

    reflections,

    patterns,

    adaptive,

    adaptiveOracle,

    prediction,

    weeklyReview,

    futureSelf,

    dailyBriefing,
  };
}