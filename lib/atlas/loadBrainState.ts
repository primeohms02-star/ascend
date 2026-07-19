import { loadProfile } from "@/lib/atlas/profile";
import { loadMomentum } from "@/lib/atlas/momentum";
import { analyzeBehavior } from "./behavior";
import {
  getLatestMission,
  getCompletedMissionTitles,
} from "@/lib/supabase/atlasMission";
import { getReflections } from "@/lib/supabase/reflections";
import { AtlasBrainState } from "./brainState";

export async function loadBrainState(
  userId: string
): Promise<AtlasBrainState> {

  const profileResult =
    await loadProfile(userId);

  const profile =
    profileResult.data;

  const momentum =
    await loadMomentum(userId);

  const activeMission =
    await getLatestMission(userId);

    const reflections =
  await getReflections(userId);

  const completedMissions =
    await getCompletedMissionTitles(userId);

  return {

    profile,

    northStar:
      profile?.north_star ??
      "Discover your purpose",

    progress:
      Number(profile?.progress ?? 0),

    journey:
      profile?.journey ??
      "Explorer",

    momentum,

    strategy: null,

    knowledge: null,

    reflections,

    completedMissions,

    activeMission,

    opportunities: [],

    recommendations: [],

   patterns: analyzeBehavior({
  profile,

  northStar:
    profile?.north_star ??
    "Discover your purpose",

  progress:
    Number(profile?.progress ?? 0),

  journey:
    profile?.journey ??
    "Explorer",

  momentum,

  strategy: null,

  knowledge: null,

  reflections: [],

  completedMissions,

  activeMission,

  opportunities: [],

  recommendations: [],

  patterns: {
    strengths: [],
    weaknesses: [],
    habits: [],
  },
}),
  };

}