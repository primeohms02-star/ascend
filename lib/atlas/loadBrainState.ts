import {
  loadProfile,
} from "@/lib/atlas/profile";

import {
  loadMomentum,
} from "@/lib/atlas/momentum";

import {
  analyzeBehavior,
} from "./behavior";

import {
  getActiveMission,
  getCompletedMissionTitles,
} from "@/lib/atlas/missionService";

import {
  getReflections,
} from "@/lib/supabase/reflections";

import {
  getProgress,
} from "@/lib/supabase/atlasProgress";

import {
  calculateAscension,
} from "@/lib/atlas/ascension";

import {
  AtlasBrainState,
} from "./brainState";

export async function loadBrainState(
  userId: string
): Promise<AtlasBrainState> {
  const [
    profileResult,
    momentum,
    activeMission,
    reflections,
    completedMissions,
    progressRecord,
  ] = await Promise.all([
    loadProfile(userId),

    loadMomentum(userId),

    getActiveMission(
      userId
    ),

    getReflections(
      userId
    ),

    getCompletedMissionTitles(
      userId
    ),

    getProgress(
      userId
    ),
  ]);

  if (profileResult.error) {
    console.error(
      "Mission Brain Profile Error:",
      profileResult.error
    );

    throw profileResult.error;
  }

  const profile =
    profileResult.data;

  const northStar =
    profile?.north_star ??
    "Discover your purpose";

  const journey =
    profile?.journey ??
    "Explorer";

  const ascension =
    calculateAscension(
      Number(
        progressRecord
          .ascension_score ?? 0
      )
    );

  const baseState:
    AtlasBrainState = {
      profile,

      northStar,

      /*
       * This represents progress within the current
       * Ascension level, not legacy profile progress.
       */
      progress:
        ascension.progressPercent,

      journey,

      momentum,

      strategy: null,

      knowledge: null,

      reflections,

      completedMissions,

      activeMission,

      opportunities: [],

      recommendations: [],

      patterns: {
        strengths: [],
        weaknesses: [],
        habits: [],
      },
    };

  return {
    ...baseState,

    patterns:
      analyzeBehavior(
        baseState
      ),
  };
}