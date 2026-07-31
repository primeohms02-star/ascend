import {
  supabaseServer,
} from "@/lib/supabase-server";

export async function getMomentum(
  userId: string
) {
  const { data, error } =
    await supabaseServer
      .from("atlas_momentum")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

  if (error) {
    console.error(
      "Momentum Load Error:",
      error
    );

    throw error;
  }

  return data ?? null;
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
  const { data, error } =
    await supabaseServer
      .from("atlas_momentum")
      .upsert(
        {
          user_id: userId,
          ...momentum,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "user_id",
        }
      )
      .select()
      .single();

  if (error) {
    console.error(
      "Momentum Save Error:",
      error
    );

    throw error;
  }

  return data;
}