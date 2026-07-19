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
  const clerkId = userId!;

  let profile = await getProfile(clerkId);

  if (!profile) {
    profile = await createProfile(clerkId);
  }

  let memory = await getMemory(clerkId);

  if (!memory) {
    memory = await createMemory(clerkId);
  }

  let missions = await getMissions(clerkId);

  if (missions.length === 0) {
    await createMission(clerkId);
    missions = await getMissions(clerkId);
  }

const identityRecord = await getIdentity(clerkId);

const identity = identityRecord
  ? {
      title: identityRecord.identity_title ?? "Explorer",
      level: 1,
      discipline: 0,
      execution: 0,
      learning: 0,
      leadership: 0,
      confidence: identityRecord.confidence ?? 0,
      badges: [],
    }
  : createIdentity();
    const progress = await getProgress(clerkId);


  const reflections = await getReflections(clerkId);

  const patterns = analyzePatterns(
  reflections.map((r) => ({
    reflection: r.reflection ?? "",
    mood: r.mood ?? 3,
  }))
);

  const adaptive = buildAdaptiveState(patterns);

  const adaptiveMission = buildAdaptiveMission(adaptive);

  const adaptiveOracle = buildAdaptiveOracle(adaptive);

  const prediction = buildPrediction(
  patterns,
  memory?.current_streak ?? 0
);

const weeklyReview = buildWeeklyReview(
  patterns,
  memory?.current_streak ?? 0
);

  const brain = {
    journey: profile?.journey ?? "Purpose Discovery",

    northStar:
      profile?.north_star ??
      "Discover your purpose",

  progress:
  progress?.ascension_score ?? 0,

momentum:
  `Level ${progress?.level ?? 1}`,

momentumMessage:
  "Keep moving toward your North Star.",
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
  memory?.current_streak ?? 0,
  progress?.ascension_score ?? 0
),

    dailyBriefing: buildDailyBriefing({
  journey: profile?.journey ?? "Purpose Discovery",

  northStar:
    profile?.north_star ??
    "Discover your purpose",

  missionTitle:
    adaptiveMission.title,

  progress:
    progress?.ascension_score ?? 0,
}),

    opportunities: rankOpportunities(
      [],
      adaptive
    ),

    recommendations: [],
missionTitle:adaptiveMission.title,
    ...brain,
  };
}