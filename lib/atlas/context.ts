import { getCurrentUserBrain } from "@/lib/services/user";
import { getAtlasMemory } from "@/lib/supabase/atlasMemory";
import { auth } from "@clerk/nextjs/server";
export async function buildAtlasContext() {
  const brain = await getCurrentUserBrain();
const { userId } = await auth();

let previousConversation = "";

if (userId) {
  const history = await getAtlasMemory(userId);

  previousConversation = history
    .slice(-10) // last 10 messages
    .map(
      (item) => `${item.role.toUpperCase()}: ${item.message}`
    )
    .join("\n");
}
  return {
    journey: brain.profile.journey,

    northStar: brain.northStar,

    identity: brain.identity.title,

    mission: brain.missionTitle,

    progress: brain.progress,

    momentum: brain.momentum,

    streak: brain.profile.current_streak,

    longestStreak:
      brain.profile.longest_streak,

    completedSteps:
      brain.profile.completed_steps,

    opportunities:
      brain.opportunities,

    recommendations:
      brain.recommendations,
      
      previousConversation: previousConversation


  };
}