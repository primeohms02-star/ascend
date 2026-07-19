"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { completeMission } from "@/lib/supabase/completeMission";
import { getMemory } from "@/lib/supabase/memory";
import { updateMemory } from "@/lib/supabase/updateMemory";

export async function completeMissionAction(
  missionId: string
) {
  const { userId } = await auth();

  if (!userId) {
    return;
  }

  await completeMission(missionId);

  const memory = await getMemory(userId);

  if (!memory) {
    return;
  }
const currentStreak =
  (memory.current_streak ?? 0) + 1;

const longestStreak = Math.max(
  currentStreak,
  memory.longest_streak ?? 0
);

const missionsCompleted =
  (memory.missions_completed ?? 0) + 1;
  await updateMemory(
    userId,
    currentStreak,
    longestStreak,
    missionsCompleted
  );

  revalidatePath("/dashboard");
}