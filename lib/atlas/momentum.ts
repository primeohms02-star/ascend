import {
  getMomentum,
  saveMomentum,
} from "@/lib/supabase/atlasMomentum";

import {
  updateStreak,
} from "@/lib/atlas/streak";

export async function completeMission(
  userId: string
) {
  const [
    storedMomentum,
    dailyStreak,
  ] = await Promise.all([
    getMomentum(userId),
    updateStreak(userId),
  ]);

  const current =
    storedMomentum ?? {
      current_streak: 0,
      longest_streak: 0,
      completed_missions: 0,
      skipped_missions: 0,
      ascension_score: 0,
    };

  const completedMissions =
    Number(
      current.completed_missions ?? 0
    ) + 1;

  /*
   * atlas_progress is the canonical XP source.
   * The legacy momentum score is preserved only
   * for database compatibility and is no longer
   * recalculated independently.
   */
  await saveMomentum(
    userId,
    {
      current_streak:
        Number(
          dailyStreak
            .current_streak ?? 0
        ),

      longest_streak:
        Number(
          dailyStreak
            .longest_streak ?? 0
        ),

      completed_missions:
        completedMissions,

      skipped_missions:
        Number(
          current.skipped_missions ?? 0
        ),

      ascension_score:
        Number(
          current.ascension_score ?? 0
        ),
    }
  );

  return await getMomentum(
    userId
  );
}

export async function loadMomentum(
  userId: string
) {
  return await getMomentum(
    userId
  );
}