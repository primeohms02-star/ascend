import { getCurrentUserBrain } from "@/lib/services/user";

export async function buildAtlasContext() {
  const brain = await getCurrentUserBrain();

  return {
    northStar: brain.northStar,
    progress: brain.progress,
    identity: brain.identity.title,
    streak: brain.memory?.currentStreak ?? 0,
    mission:
      brain.missions?.[0]?.title ??
      "No mission assigned",
    momentum: brain.momentum,
  };
}