import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { loadAtlasContext } from "@/lib/atlas/brain";

export async function getAtlasDashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const atlas = await loadAtlasContext(userId);

  return {
    // Existing Dashboard Fields
    northStar: atlas.profile.north_star,

    progress: atlas.profile.progress,

    momentum:
      atlas.momentum?.current_streak ?? 0,

    momentumMessage:
      "Keep moving toward your North Star.",

    missions: atlas.mission
      ? [atlas.mission]
      : [],

    atlasProgress:
      atlas.momentum ?? {
        ascension_score: 0,
        level: 1,
      },

    identity: {
      title: atlas.profile.journey,
      level: 1,
    },

    opportunities: [],

    recommendations: [],

    dailyBriefing: {
      greeting: `Welcome back ${atlas.profile.full_name || "Explorer"}.`,
      summary:
        "Atlas has analyzed your current trajectory.",

      focus:
        atlas.mission?.mission ??
        "No mission available.",

      oracle:
        "Small consistent actions create extraordinary futures.",
    },

    // Raw Atlas Data
    profile: atlas.profile,
    mission: atlas.mission,
    strategy: atlas.strategy,
    knowledge: atlas.knowledge,
    facts: atlas.facts,
    reflection: atlas.reflection,
    journey: atlas.journey,
    compassAnswers: atlas.compassAnswers,
    compassResults: atlas.compassResults,
    memory: atlas.memory,
  };
}