import { supabaseServer } from "@/lib/supabase-server";

export async function loadStrategy(userId: string) {
  return await supabaseServer
    .from("atlas_strategy")
    .select("*")
    .eq("user_id", userId)
    .single();
}

export async function updateStrategy(
  userId: string,
  strategy: {
    vision?: string;
    objective_90_day?: string;
    monthly_plan?: string;
    weekly_plan?: string;
    today_mission?: string;
  }
) {
  return await supabaseServer
    .from("atlas_strategy")
    .update(strategy)
    .eq("user_id", userId);
}
export async function updateTodayMission(
  userId: string,
  mission: string
) {
  return await supabaseServer
    .from("atlas_strategy")
    .update({
      today_mission: mission,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}
export async function clearTodayMission(
  userId: string
) {
  return await supabaseServer
    .from("atlas_strategy")
    .update({
      today_mission: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}