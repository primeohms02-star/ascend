import { supabase } from "@/lib/supabase/client";

export async function updateStreak(userId: string) {
  // Load streak record
  let { data: streak, error } = await supabase
    .from("atlas_streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  // Create it if it doesn't exist
  if (error || !streak) {
    const { data: created, error: createError } =
      await supabase
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
      throw createError;
    }

    streak = created;
  }

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const yesterdayString =
    yesterday.toISOString().split("T")[0];

  let currentStreak = streak.current_streak;
  let longestStreak = streak.longest_streak;

  if (streak.last_mission_date === todayString) {
    return streak;
  }

  if (streak.last_mission_date === yesterdayString) {
    currentStreak++;
  } else {
    currentStreak = 1;
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  const { data, error: updateError } =
    await supabase
      .from("atlas_streaks")
      .update({
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_mission_date: todayString,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

  if (updateError) {
    throw updateError;
  }

  return data;
}