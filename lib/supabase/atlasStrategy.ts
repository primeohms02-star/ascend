import { supabase } from "./client";

export async function saveStrategy(
  userId: string,
  strategy: {
    vision: string;
    objective_90_day: string;
    monthly_plan: string;
    weekly_plan: string;
    today_mission: string;
  }
) {
  const { error } = await supabase
    .from("atlas_strategy")
    .upsert(
      {
        user_id: userId,
        ...strategy,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) {
    console.error("Strategy save error:", error);
    throw error;
  }
}

export async function getStrategy(
  userId: string
) {
  const { data, error } = await supabase
    .from("atlas_strategy")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) return null;

  return data;
}