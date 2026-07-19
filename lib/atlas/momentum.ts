import {
  getMomentum,
  saveMomentum,
} from "@/lib/supabase/atlasMomentum";

export async function completeMission(
  userId: string
) {
  const current =
    (await getMomentum(userId)) ?? {
      current_streak: 0,
      longest_streak: 0,
      completed_missions: 0,
      skipped_missions: 0,
      ascension_score: 0,
    };

  const streak =
    current.current_streak + 1;

  const longest = Math.max(
    streak,
    current.longest_streak
  );

  const completed =
    current.completed_missions + 1;

  // Initial scoring algorithm
  const score =
    completed * 10 +
    streak * 5;

  await saveMomentum(userId, {
    current_streak: streak,
    longest_streak: longest,
    completed_missions: completed,
    skipped_missions:
      current.skipped_missions,
    ascension_score: score,
  });

  return await getMomentum(userId);
}
export async function loadMomentum(
  userId: string
) {
  return await getMomentum(userId);
}