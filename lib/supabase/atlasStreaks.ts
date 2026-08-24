import "server-only";

import { supabaseServer } from "@/lib/supabase-server";

export async function getStreak(userId: string) {
  const { data, error } = await supabaseServer
    .from("atlas_streaks")
    .select("current_streak,longest_streak,last_mission_date")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Streak Load Error:", error);
    throw error;
  }

  return data ?? null;
}
