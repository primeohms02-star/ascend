import {
  supabaseServer,
} from "@/lib/supabase-server";

export type CompletedMissionRecord = {
  id: string;
  user_id: string;
  mission: string;
  reason: string | null;
  status: string;
  created_at?: string;
  completed_at?: string | null;
};

export type AtomicProgressRecord = {
  user_id: string;
  ascension_score: number | null;
  level: number | null;
  updated_at?: string | null;
};

export type AtomicMomentumRecord = {
  user_id: string;
  current_streak: number | null;
  longest_streak: number | null;
  completed_missions: number | null;
  skipped_missions: number | null;
  ascension_score: number | null;
  updated_at?: string | null;
};

export type AtomicStreakRecord = {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_mission_date: string | null;
  updated_at?: string | null;
};

export type MissionCompletionTransaction = {
  completedMission:
    CompletedMissionRecord;

  progress:
    AtomicProgressRecord;

  momentum:
    AtomicMomentumRecord;

  streak:
    AtomicStreakRecord;
};

export async function completeMissionTransaction(
  userId: string,
  missionId: string,
  xpReward: number
): Promise<
  MissionCompletionTransaction | null
> {
  /*
   * The generated Supabase types do not yet include
   * this new database function, so the RPC boundary
   * is typed explicitly here.
   */
  const { data, error } =
    await (
      supabaseServer as any
    ).rpc(
      "complete_atlas_mission",
      {
        p_user_id: userId,
        p_mission_id:
          missionId,
        p_xp_reward:
          xpReward,
      }
    );

  if (error) {
    console.error(
      "Atomic Mission Completion Error:",
      error
    );

    throw error;
  }

  if (!data) {
    return null;
  }

  return data as MissionCompletionTransaction;
}