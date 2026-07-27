import { supabase } from "./client";

export type AtlasMissionRecord = {
  id: string;
  user_id: string;
  mission: string;
  reason: string | null;
  status:
    | "active"
    | "completed"
    | "skipped";
  created_at?: string;
  completed_at?: string | null;
};

export async function saveMission(
  userId: string,
  mission: string,
  reason: string
) {
  const { data, error } = await supabase
    .from("atlas_missions")
    .insert({
      user_id: userId,
      mission,
      reason,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    console.error(
      "Mission Save Error:",
      error
    );

    throw error;
  }

  return data as AtlasMissionRecord;
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
    .maybeSingle();

  if (error) {
    console.error(
      "Get Latest Mission Error:",
      error
    );

    return null;
  }

  return data as AtlasMissionRecord | null;
}

export async function completeMissionById(
  userId: string,
  missionId: string
) {
  /*
   * Requiring status=active makes completion
   * idempotent. A completed mission cannot award
   * XP a second time.
   */
  const { data, error } = await supabase
    .from("atlas_missions")
    .update({
      status: "completed",
      completed_at:
        new Date().toISOString(),
    })
    .eq("id", missionId)
    .eq("user_id", userId)
    .eq("status", "active")
    .select("*")
    .maybeSingle();

  if (error) {
    console.error(
      "Mission Completion Error:",
      error
    );

    throw error;
  }

  return data as AtlasMissionRecord | null;
}

/*
 * Retained for compatibility with older files.
 * New code should complete an exact mission ID.
 */
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
    .maybeSingle();

  if (error) {
    console.error(
      "Find Active Mission Error:",
      error
    );

    throw error;
  }

  if (!data) {
    return null;
  }

  return completeMissionById(
    userId,
    data.id
  );
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
    .maybeSingle();

  if (error) {
    console.error(
      "Find Mission to Skip Error:",
      error
    );

    throw error;
  }

  if (!data) {
    return null;
  }

  const { data: skippedMission, error: updateError } =
    await supabase
      .from("atlas_missions")
      .update({
        status: "skipped",
      })
      .eq("id", data.id)
      .eq("user_id", userId)
      .eq("status", "active")
      .select("*")
      .maybeSingle();

  if (updateError) {
    console.error(
      "Mission Skip Error:",
      updateError
    );

    throw updateError;
  }

  return skippedMission as AtlasMissionRecord | null;
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
    console.error(
      "Get Completed Missions Error:",
      error
    );

    return [];
  }

  return (data ?? []).map(
    (mission) => mission.mission
  );
}