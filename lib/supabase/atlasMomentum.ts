import { supabase } from "./client";

export async function getMomentum(userId: string) {
  const { data } = await supabase
    .from("atlas_momentum")
    .select("*")
    .eq("user_id", userId)
    .single();

  return data;
}

export async function saveMomentum(
  userId: string,
  momentum: {
    current_streak: number;
    longest_streak: number;
    completed_missions: number;
    skipped_missions: number;
    ascension_score: number;
  }
) {
  const { error } = await supabase
    .from("atlas_momentum")
    .upsert(
      {
        user_id: userId,
        ...momentum,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) {
    console.error("Momentum save error:", error);
    throw error;
  }
}