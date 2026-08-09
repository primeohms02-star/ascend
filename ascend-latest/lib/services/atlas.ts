import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getGreeting } from "@/lib/utils/greeting";
import { loadAtlasContext } from "@/lib/atlas/brain";

export async function getAtlasDashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const atlas = await loadAtlasContext(userId);

  const activeMission =
  atlas.missions?.find((m: any) => m.status === "active") ??
  atlas.missions?.[0] ??
  null;

  return {
    // Existing Dashboard Fields
    northStar: atlas.profile.north_star,

    progress: atlas.profile.progress,

    momentum:
      atlas.momentum?.current_streak ?? 0,

    momentumMessage:
      "Keep moving toward your North Star.",

    missions:
  atlas.missions ??
  [],
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
    greeting: `${getGreeting()}, ${atlas.profile.full_name}.`,
      summary:
        "Atlas has analyzed your current trajectory.",

     
      oracle:
        "Small consistent actions create extraordinary futures.",
    },

    // Raw Atlas Data
    profile: atlas.profile,
    mission: activeMission.mission,
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