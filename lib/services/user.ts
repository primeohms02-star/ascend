import {
  auth,
} from "@clerk/nextjs/server";

import {
  redirect,
} from "next/navigation";

import {
  getProfile,
} from "@/lib/supabase/profiles";

import {
  getMemory,
} from "@/lib/supabase/memory";

import {
  getMissions,
} from "@/lib/supabase/missions";

import {
  getReflections,
} from "@/lib/supabase/reflections";

import {
  getIdentity,
} from "@/lib/supabase/atlasIdentity";

import {
  getProgress,
} from "@/lib/supabase/atlasProgress";

import {
  analyzePatterns,
} from "@/lib/atlas/patterns";

import {
  buildAdaptiveState,
} from "@/lib/atlas/adaptive";

import {
  buildAdaptiveMission,
} from "@/lib/atlas/adaptiveMission";

import {
  buildAdaptiveOracle,
} from "@/lib/atlas/adaptiveOracle";

import {
  rankOpportunities,
} from "@/lib/atlas/opportunityRanking";

import {
  buildPrediction,
} from "@/lib/atlas/predictive";

import {
  buildWeeklyReview,
} from "@/lib/atlas/weeklyReview";

import {
  buildFutureSelf,
} from "@/lib/atlas/futureSelf";

import {
  buildDailyBriefing,
} from "@/lib/atlas/dailyBriefing";

import {
  calculateAscension,
} from "@/lib/atlas/ascension";

export async function getCurrentUserBrain() {
  const { userId } =
    await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const clerkId = userId;

  /*
   * All context reads are performed without creating
   * profiles, memory rows, missions or progression.
   */
  const [
    storedProfile,
    storedMemory,
    missions,
    progress,
    identityRecord,
    reflections,
  ] = await Promise.all([
    getProfile(clerkId),
    getMemory(clerkId),
    getMissions(clerkId),
    getProgress(clerkId),
    getIdentity(clerkId),
    getReflections(clerkId),
  ]);

  /*
   * A neutral in-memory fallback keeps Atlas stable
   * if a Clerk webhook has not created the profile
   * yet. It is never written during a read.
   */
  const profile =
    storedProfile ?? {
      clerk_id: clerkId,
      full_name: "",
      email: "",

      journey:
        "Purpose Discovery",

      north_star: "",

      progress: 0,
      completed_steps: 0,

      current_streak: 0,
      longest_streak: 0,
      last_mission_date: null,
    };

  const memory =
    storedMemory ?? {
      user_id: clerkId,

      strengths: [],
      weaknesses: [],

      last_mission: null,

      current_streak: 0,
      longest_streak: 0,

      missions_completed: 0,
      missions_missed: 0,
    };

  const ascension =
    calculateAscension(
      Number(
        progress.ascension_score ?? 0
      )
    );

  const identity = {
    title:
      identityRecord
        ?.identity_title ??
      ascension.title,

    level:
      ascension.level,

    discipline: 0,
    execution: 0,
    learning: 0,
    leadership: 0,

    confidence:
      identityRecord
        ?.confidence ?? 0,

    badges: [],
  };

  const patterns =
    analyzePatterns(
      reflections.map(
        (reflection) => ({
          reflection:
            reflection.reflection ??
            "",

          mood:
            reflection.mood ?? 3,
        })
      )
    );

  /*
   * Adaptive state may influence tone and difficulty,
   * but it does not define the current mission.
   */
  const adaptive =
    buildAdaptiveState(
      patterns
    );

  const adaptiveMission =
    buildAdaptiveMission(
      adaptive
    );

  const adaptiveOracle =
    buildAdaptiveOracle(
      adaptive
    );

  const activeMission =
    missions.find(
      (mission) =>
        mission.status ===
        "active"
    ) ?? null;

  const currentStreak =
    Number(
      memory.current_streak ?? 0
    );

  const journey =
    profile.journey ??
    "Purpose Discovery";

  const northStar =
    profile.north_star ??
    "";

  const brain = {
    journey,
    northStar,

    progress:
      ascension.score,

    momentum:
      `Level ${ascension.level}`,

    momentumMessage:
      "Keep moving toward your North Star.",
  };

  return {
    profile,

    identity,

    atlasProgress:
      progress,

    ascension,

    memory,
    missions,
    reflections,

    patterns,
    adaptive,

    /*
     * Retained as an adaptive suggestion for older
     * components. It is not the current mission.
     */
    adaptiveMission,
    adaptiveOracle,

    prediction:
      buildPrediction(
        patterns,
        currentStreak
      ),

    weeklyReview:
      buildWeeklyReview(
        patterns,
        currentStreak
      ),

    futureSelf:
      buildFutureSelf(
        patterns,
        currentStreak,
        ascension.score
      ),

    dailyBriefing:
      buildDailyBriefing({
        journey,
        northStar,

        missionTitle:
          activeMission
            ?.mission ??
          "No active mission",

        progress:
          ascension.score,
      }),

    opportunities:
      rankOpportunities(
        [],
        adaptive
      ),

    recommendations: [],

    /*
     * This compatibility field now follows the
     * authoritative active mission.
     */
    missionTitle:
      activeMission?.mission ??
      "No active mission",

    activeMission,

    ...brain,
  };
}