import {
  supabaseServer,
} from "@/lib/supabase-server";

function getDateKey(
  date: Date
): string {
  return date
    .toISOString()
    .split("T")[0];
}

export async function updateStreak(
  userId: string
) {
  const {
    data: existing,
    error: loadError,
  } = await supabaseServer
    .from("atlas_streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (loadError) {
    console.error(
      "Streak Load Error:",
      loadError
    );

    throw loadError;
  }

  let streak = existing;

  if (!streak) {
    const {
      data: created,
      error: createError,
    } = await supabaseServer
      .from("atlas_streaks")
      .insert({
        user_id: userId,
        current_streak: 0,
        longest_streak: 0,
        last_mission_date: null,
      })
      .select()
      .single();

    if (createError) {
      console.error(
        "Streak Creation Error:",
        createError
      );

      throw createError;
    }

    streak = created;
  }

  const today =
    new Date();

  const todayKey =
    getDateKey(today);

  /*
   * Completing more than one mission on the same
   * calendar day must not increase a day streak.
   */
  if (
    streak.last_mission_date ===
    todayKey
  ) {
    return streak;
  }

  const yesterday =
    new Date(today);

  yesterday.setUTCDate(
    yesterday.getUTCDate() - 1
  );

  const yesterdayKey =
    getDateKey(yesterday);

  const previousStreak =
    Number(
      streak.current_streak ?? 0
    );

  const currentStreak =
    streak.last_mission_date ===
    yesterdayKey
      ? previousStreak + 1
      : 1;

  const longestStreak =
    Math.max(
      currentStreak,
      Number(
        streak.longest_streak ?? 0
      )
    );

  const {
    data: updated,
    error: updateError,
  } = await supabaseServer
    .from("atlas_streaks")
    .update({
      current_streak:
        currentStreak,
      longest_streak:
        longestStreak,
      last_mission_date:
        todayKey,
      updated_at:
        new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (updateError) {
    console.error(
      "Streak Update Error:",
      updateError
    );

    throw updateError;
  }

  return updated;
}