import {
  supabaseServer,
} from "@/lib/supabase-server";

export type AtlasMissionRecord = {
  id: string;
  user_id: string;
  mission: string;
  reason: string | null;

  status:
    | "active"
    | "completed"
    | "skipped"
    | "replaced"
    | "cancelled";

  created_at?: string;
  completed_at?: string | null;
};

export async function saveMission(
  userId: string,
  mission: string,
  reason: string
) {
  const cleanMission =
    mission.trim();

  const cleanReason =
    reason.trim();

  if (
    !cleanMission ||
    !cleanReason
  ) {
    throw new Error(
      "A mission and reason are required."
    );
  }

  /*
   * Never create another mission while one is active.
   */
  const activeMission =
    await getActiveMission(
      userId
    );

  if (activeMission) {
    return activeMission;
  }

  const { data, error } =
    await supabaseServer
      .from("atlas_missions")
      .insert({
        user_id: userId,
        mission:
          cleanMission,
        reason:
          cleanReason,
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

export async function getActiveMission(
  userId: string
) {
  const { data, error } =
    await supabaseServer
      .from("atlas_missions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

  if (error) {
    console.error(
      "Get Active Mission Error:",
      error
    );

    throw error;
  }

  return data as
    | AtlasMissionRecord
    | null;
}

export async function getLatestMission(
  userId: string
) {
  const { data, error } =
    await supabaseServer
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

    throw error;
  }

  return data as
    | AtlasMissionRecord
    | null;
}

export async function completeMissionById(
  userId: string,
  missionId: string
) {
  const { data, error } =
    await supabaseServer
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

  return data as
    | AtlasMissionRecord
    | null;
}

/*
 * Legacy helper retained temporarily.
 * New interfaces should complete an exact mission ID.
 */
export async function completeLatestMission(
  userId: string
) {
  const activeMission =
    await getActiveMission(
      userId
    );

  if (!activeMission) {
    return null;
  }

  return completeMissionById(
    userId,
    activeMission.id
  );
}

export async function skipLatestMission(
  userId: string
) {
  const activeMission =
    await getActiveMission(
      userId
    );

  if (!activeMission) {
    return null;
  }

  const {
    data,
    error,
  } = await supabaseServer
    .from("atlas_missions")
    .update({
      status: "skipped",
    })
    .eq(
      "id",
      activeMission.id
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .select("*")
    .maybeSingle();

  if (error) {
    console.error(
      "Mission Skip Error:",
      error
    );

    throw error;
  }

  return data as
    | AtlasMissionRecord
    | null;
}

export async function getCompletedMissionTitles(
  userId: string
) {
  const { data, error } =
    await supabaseServer
      .from("atlas_missions")
      .select(
        "mission,completed_at"
      )
      .eq("user_id", userId)
      .eq(
        "status",
        "completed"
      )
      .order("completed_at", {
        ascending: true,
      });

  if (error) {
    console.error(
      "Get Completed Missions Error:",
      error
    );

    throw error;
  }

  return (data ?? []).map(
    (storedMission) =>
      storedMission.mission
  );
}