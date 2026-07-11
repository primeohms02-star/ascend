import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getProfile } from "@/lib/supabase/profiles";
import { getMemory } from "@/lib/supabase/memory";
import { getMissions } from "@/lib/supabase/missions";

import { createProfile } from "@/lib/supabase/createProfile";
import { createMemory } from "@/lib/supabase/createMemory";
import { createMission } from "@/lib/supabase/createMission";

import { buildBrainContext } from "@/lib/brain/context";

export async function getCurrentUserBrain() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Ensure profile exists
  let profile = await getProfile(userId);

  if (!profile) {
    profile = await createProfile(userId);
  }

  // Ensure memory exists
  let memory = await getMemory(userId);

  if (!memory) {
    memory = await createMemory(userId);
  }

  // Ensure at least one mission exists
  let missions = await getMissions(userId);

  if (missions.length === 0) {
    await createMission(userId);
    missions = await getMissions(userId);
  }

  const firstAnswer =
    profile?.journey ?? "I'm Not Sure Yet";

  const brain = buildBrainContext(firstAnswer);

  return {
    ...brain,
    profile,
    memory,
    missions,
  };
}