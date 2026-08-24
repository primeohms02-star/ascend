import "server-only";

import {
  supabaseServer,
} from "@/lib/supabase-server";

import {
  normalizeMissionContent,
} from "@/lib/atlas/missionContent";

export type MissionStatus =
  | "active"
  | "completed"
  | "skipped"
  | "replaced"
  | "cancelled"
  | "pending";

export type MissionRecord = {
  id: string;

  user_id: string;

  mission: string;

  reason: string | null;

  status:
    MissionStatus | null;

  created_at:
    string | null;

  completed_at:
    string | null;
};

export type MissionOperationType =
  | "onboarding_replace"
  | "complete";

export type MissionOperationResult = {
  operationId: string;

  replayed: boolean;

  activeMission:
    MissionRecord;
};

export type CompletionResult =
  MissionOperationResult & {
    completedMission:
      MissionRecord;

    xpAwarded: number;

    progress: {
      user_id: string;

      ascension_score:
        number;

      level: number;

      updated_at?:
        string | null;
    };

    momentum: {
      user_id: string;

      current_streak:
        number | null;

      longest_streak:
        number | null;

      completed_missions:
        number | null;

      skipped_missions:
        number | null;

      ascension_score:
        number | null;

      updated_at?:
        string | null;
    };

    streak: {
      user_id: string;

      current_streak:
        number;

      longest_streak:
        number;

      last_mission_date:
        string | null;

      updated_at?:
        string | null;
    };
  };

export type OnboardingReplacementResult =
  MissionOperationResult & {
    isRecalibration:
      boolean;

    previousMission:
      MissionRecord | null;
  };

type StoredOperation = {
  operation_id: string;

  user_id: string;

  operation_type:
    MissionOperationType;

  result:
    MissionOperationResult;
};

function cleanRequired(
  value: string,
  label: string
) {
  const cleanValue =
    value.trim();

  if (!cleanValue) {
    throw new Error(
      `${label} is required.`
    );
  }

  return cleanValue;
}

function normalizeMissionRecord(
  record: MissionRecord
): MissionRecord {
  const content =
    normalizeMissionContent(
      record.mission,
      record.reason
    );

  return {
    ...record,

    mission: content.title,

    reason: content.description,
  };
}

function normalizeOperationResult<
  Result extends MissionOperationResult,
>(result: Result): Result {
  const candidate = result as
    Result & {
      completedMission?: MissionRecord;
      previousMission?: MissionRecord | null;
    };

  return {
    ...result,

    activeMission:
      normalizeMissionRecord(
        result.activeMission
      ),

    ...(candidate.completedMission
      ? {
          completedMission:
            normalizeMissionRecord(
              candidate.completedMission
            ),
        }
      : {}),

    ...(candidate.previousMission
      ? {
          previousMission:
            normalizeMissionRecord(
              candidate.previousMission
            ),
        }
      : {}),
  } as Result;
}

export async function getMissionOperation<
  Result extends
    MissionOperationResult,
>(
  userId: string,
  operationId: string,
  operationType:
    MissionOperationType
): Promise<Result | null> {
  const {
    data,
    error,
  } = await supabaseServer
    .from(
      "atlas_mission_operations" as never
    )
    .select(
      "operation_id,user_id,operation_type,result"
    )
    .eq(
      "operation_id",
      operationId
    )
    .eq(
      "user_id",
      userId
    )
    .eq(
      "operation_type",
      operationType
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Mission Operation Lookup Error:",
      error
    );

    throw error;
  }

  const operation =
    data as
      | StoredOperation
      | null;

  if (!operation) {
    return null;
  }

  return normalizeOperationResult({
    ...operation.result,

    replayed: true,
  } as Result);
}

export async function getActiveMission(
  userId: string
): Promise<
  MissionRecord | null
> {
  const {
    data,
    error,
  } = await supabaseServer
    .from("atlas_missions")
    .select("*")
    .eq(
      "user_id",
      userId
    )
    .eq(
      "status",
      "active"
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Active Mission Read Error:",
      error
    );

    throw error;
  }

  const storedMission = data as
    | MissionRecord
    | null;

  if (!storedMission) {
    return null;
  }

  const normalizedMission =
    normalizeMissionRecord(
      storedMission
    );

  if (
    normalizedMission.mission !==
      storedMission.mission ||
    normalizedMission.reason !==
      storedMission.reason
  ) {
    const {
      error: repairError,
    } = await supabaseServer
      .from("atlas_missions")
      .update({
        mission:
          normalizedMission.mission,

        reason:
          normalizedMission.reason,
      })
      .eq("id", storedMission.id)
      .eq("user_id", userId)
      .eq("status", "active");

    if (repairError) {
      console.error(
        "Active Mission Repair Error:",
        repairError
      );
    }
  }

  return normalizedMission;
}

export async function getLatestMission(
  userId: string
): Promise<
  MissionRecord | null
> {
  const {
    data,
    error,
  } = await supabaseServer
    .from("atlas_missions")
    .select("*")
    .eq(
      "user_id",
      userId
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Latest Mission Read Error:",
      error
    );

    throw error;
  }

  const mission = data as
    | MissionRecord
    | null;

  return mission
    ? normalizeMissionRecord(
        mission
      )
    : null;
}

export async function getMissionHistory(
  userId: string
): Promise<
  MissionRecord[]
> {
  const {
    data,
    error,
  } = await supabaseServer
    .from("atlas_missions")
    .select("*")
    .eq(
      "user_id",
      userId
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (error) {
    console.error(
      "Mission History Read Error:",
      error
    );

    throw error;
  }

  return (
    (data ?? []) as MissionRecord[]
  ).map(
    normalizeMissionRecord
  );
}

export async function getCompletedMissionTitles(
  userId: string
): Promise<string[]> {
  const {
    data,
    error,
  } = await supabaseServer
    .from("atlas_missions")
    .select(
      "mission,completed_at"
    )
    .eq(
      "user_id",
      userId
    )
    .eq(
      "status",
      "completed"
    )
    .order(
      "completed_at",
      {
        ascending: true,
      }
    );

  if (error) {
    console.error(
      "Completed Mission Read Error:",
      error
    );

    throw error;
  }

  return (
    data ?? []
  ).map(
    (record) =>
      normalizeMissionContent(
        record.mission,
        null
      ).title
  );
}

export async function replaceMissionForOnboarding(
  input: {
    userId: string;

    operationId: string;

    identity: string;

    goal: string;

    skills: string[];

    challenges: string[];

    northStar: string;

    directionFact: string;

    previousDirectionFact:
      string | null;

    mission: string;

    reason: string;
  }
): Promise<OnboardingReplacementResult> {
  const mission =
    normalizeMissionContent(
      input.mission,
      input.reason
    );

  const {
    data,
    error,
  } = await supabaseServer.rpc(
    "replace_atlas_mission" as never,
    {
      p_user_id:
        cleanRequired(
          input.userId,
          "User ID"
        ),

      p_operation_id:
        input.operationId,

      p_identity:
        cleanRequired(
          input.identity,
          "Identity"
        ),

      p_goal:
        cleanRequired(
          input.goal,
          "Goal"
        ),

      p_skills:
        input.skills,

      p_challenges:
        input.challenges,

      p_north_star:
        cleanRequired(
          input.northStar,
          "North Star"
        ),

      p_direction_fact:
        cleanRequired(
          input.directionFact,
          "Direction fact"
        ),

      p_previous_direction_fact:
        input.previousDirectionFact,

      p_mission:
        cleanRequired(
          mission.title,
          "Mission"
        ),

      p_reason:
        cleanRequired(
          mission.description,
          "Mission reason"
        ),
    } as never
  );

  if (error) {
    console.error(
      "Onboarding Mission Transaction Error:",
      error
    );

    throw error;
  }

  if (!data) {
    throw new Error(
      "The onboarding mission transaction returned no result."
    );
  }

  return normalizeOperationResult(
    data as
      OnboardingReplacementResult
  );
}

export async function completeMissionLifecycle(
  input: {
    userId: string;

    missionId: string;

    operationId: string;

    nextMission: string;

    nextReason: string;

    xpReward: number;
  }
): Promise<CompletionResult> {
  const nextMission =
    normalizeMissionContent(
      input.nextMission,
      input.nextReason
    );

  const {
    data,
    error,
  } = await supabaseServer.rpc(
    "complete_atlas_mission" as never,
    {
      p_user_id:
        cleanRequired(
          input.userId,
          "User ID"
        ),

      p_mission_id:
        input.missionId,

      p_operation_id:
        input.operationId,

      p_next_mission:
        cleanRequired(
          nextMission.title,
          "Next mission"
        ),

      p_next_reason:
        cleanRequired(
          nextMission.description,
          "Next mission reason"
        ),

      p_xp_reward:
        Math.max(
          0,
          Math.floor(
            input.xpReward
          )
        ),
    } as never
  );

  if (error) {
    console.error(
      "Mission Completion Transaction Error:",
      error
    );

    throw error;
  }

  if (!data) {
    throw new Error(
      "The mission completion transaction returned no result."
    );
  }

  return normalizeOperationResult(
    data as
      CompletionResult
  );
}
