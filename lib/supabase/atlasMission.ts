import { supabase } from "./client";

export async function saveMission(
  userId: string,
  mission: string,
  reason: string
) {
  const { error } = await supabase
    .from("atlas_missions")
   .insert({
  user_id: userId,
  mission,
  reason,
  status: "active",
});

  if (error) {
    console.error("Mission save error:", error);
    throw error;
  }
}

export async function getLatestMission(
  userId: string
) {
  const { data, error } = await supabase
    .from("atlas_missions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function completeLatestMission(
  userId: string
) {
  const { data, error } = await supabase
    .from("atlas_missions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .single();

  if (error || !data) {
    return;
  }

  const { error: updateError } = await supabase
    .from("atlas_missions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  if (updateError) {
    console.error(
      "Mission completion error:",
      updateError
    );
    throw updateError;
  }
}

export async function skipLatestMission(
  userId: string
) {
  const { data, error } = await supabase
    .from("atlas_missions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .single();

  if (error || !data) {
    return;
  }

  const { error: updateError } = await supabase
    .from("atlas_missions")
    .update({
      status: "skipped",
    })
    .eq("id", data.id);

  if (updateError) {
    console.error(
      "Mission skip error:",
      updateError
    );
    throw updateError;
  }
}
export async function getCompletedMissionTitles(
  userId: string
) {
  const { data, error } = await supabase
    .from("atlas_missions")
    .select("mission")
    .eq("user_id", userId)
    .eq("status", "completed");

  if (error) {
    return [];
  }

  return data.map((m) => m.mission);
}