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

import { createIdentity } from "../brain/identity";

export async function getCurrentUserBrain() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  let profile = await getProfile(userId);

  if (!profile) {
    profile = await createProfile(userId);
  }

  let memory = await getMemory(userId);

  if (!memory) {
    memory = await createMemory(userId);
  }

  let missions = await getMissions(userId);

  if (missions.length === 0) {
    await createMission(userId);
    missions = await getMissions(userId);
  }

  let identity = await getIdentity(userId);

  if (!identity) {
    identity = createIdentity();
  } else {
    identity = {
      title: identity.identity_title ?? "Explorer",
      level: 1,
      confidence: identity.confidence ?? 0,
    };
  }

  const progress = await getProgress(userId);

  const reflections = await getReflections(userId);

  const patterns = analyzePatterns(reflections);

  const adaptive = buildAdaptiveState(patterns);

  const adaptiveMission = buildAdaptiveMission(adaptive);

  const adaptiveOracle = buildAdaptiveOracle(adaptive);

  const prediction = buildPrediction(
    patterns,
    memory.current_streak ?? 0
  );

  const weeklyReview = buildWeeklyReview(
    patterns,
    memory.current_streak ?? 0
  );

  const brain = {
    journey: profile?.journey ?? "Purpose Discovery",

    northStar:
      profile?.north_star ??
      "Discover your purpose",

    progress:
      progress.progress_percentage ?? 0,

    missionTitle:
      adaptiveMission.title,

    momentum:
      progress.momentum_status ?? "Building",

    momentumMessage:
      progress.momentum_message ??
      "Keep moving forward.",
  };

  return {
    profile,

    identity,

    atlasProgress: progress,

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
      memory.current_streak ?? 0,
      progress.progress_percentage ?? 0
    ),

    dailyBriefing: buildDailyBriefing(brain),

    opportunities: rankOpportunities(
      [],
      adaptive
    ),

    recommendations: [],

    ...brain,
  };
}