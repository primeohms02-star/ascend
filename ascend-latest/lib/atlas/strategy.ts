import {
  supabaseServer,
} from "@/lib/supabase-server";

export async function loadStrategy(
  userId: string
) {
  const { data, error } =
    await supabaseServer
      .from("atlas_strategy")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

  if (error) {
    console.error(
      "Atlas Strategy Load Error:",
      error
    );

    throw error;
  }

  return data ?? null;
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
  const { data, error } =
    await supabaseServer
      .from("atlas_strategy")
      .update({
        ...strategy,
        updated_at:
          new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .maybeSingle();

  if (error) {
    console.error(
      "Atlas Strategy Update Error:",
      error
    );

    throw error;
  }

  return data ?? null;
}

export async function updateTodayMission(
  userId: string,
  mission: string
) {
  const { data, error } =
    await supabaseServer
      .from("atlas_strategy")
      .update({
        today_mission:
          mission.trim(),
        updated_at:
          new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .maybeSingle();

  if (error) {
    console.error(
      "Today Mission Update Error:",
      error
    );

    throw error;
  }

  return data ?? null;
}

export async function clearTodayMission(
  userId: string
) {
  const { data, error } =
    await supabaseServer
      .from("atlas_strategy")
      .update({
        today_mission: null,
        updated_at:
          new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .maybeSingle();

  if (error) {
    console.error(
      "Today Mission Clear Error:",
      error
    );

    throw error;
  }

  return data ?? null;
}