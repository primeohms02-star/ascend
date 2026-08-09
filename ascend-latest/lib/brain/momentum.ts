import { supabaseServer } from "@/lib/supabase-server";

export async function loadMomentum(
  userId: string
) {
  return await supabaseServer
    .from("atlas_momentum")
    .select("*")
    .eq("user_id", userId)
    .single();
}

export async function updateMomentum(
  userId: string,
  data: {
    current_streak: number;
    longest_streak: number;
    completed_missions: number;
    ascension_score: number;
  }
) {
  return await supabaseServer
    .from("atlas_momentum")
    .update({
      current_streak: data.current_streak,
      longest_streak: data.longest_streak,
      completed_missions: data.completed_missions,
      ascension_score: data.ascension_score,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}