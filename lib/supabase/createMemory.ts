import { supabase } from "./client";

export async function createMemory(userId: string) {
  const { data, error } = await supabase
    .from("memory")
    .insert({
      user_id: userId,
      strengths: [],
      weaknesses: [],
      last_mission: null,
      current_streak: 0,
      longest_streak: 0,
      missions_completed: 0,
      missions_missed: 0,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}