import { supabase } from "./client";

export async function updateMemory(
  userId: string,
  currentStreak: number,
  longestStreak: number,
  missionsCompleted: number
) {
  const { data, error } = await supabase
    .from("memory")
    .update({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      missions_completed: missionsCompleted,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}