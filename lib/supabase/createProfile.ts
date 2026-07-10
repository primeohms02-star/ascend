import { supabase } from "./client";

export async function createProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      journey: "Explorer",
      north_star: "Discover my purpose",
      progress: 0,
      completed_steps: 0,
      current_streak: 0,
      longest_streak: 0,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}