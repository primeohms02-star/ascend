import { supabaseServer } from "@/lib/supabase-server";

export async function loadProfile(clerkId: string) {
  const { data, error } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();

  return { data, error };
}

export async function updateProfileProgress(
  clerkId: string,
  profile: any
) {
  const today = new Date().toISOString().split("T")[0];

  const lastMission =
    profile.last_mission_date
      ? new Date(profile.last_mission_date)
          .toISOString()
          .split("T")[0]
      : null;

  let currentStreak = profile.current_streak ?? 0;

  if (lastMission !== today) {
    if (lastMission) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (
        lastMission ===
        yesterday.toISOString().split("T")[0]
      ) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
  }

  const longestStreak = Math.max(
    currentStreak,
    profile.longest_streak ?? 0
  );

  const newProgress = Math.min(
    (profile.progress ?? 0) + 5,
    100
  );

  return await supabaseServer
    .from("profiles")
    .update({
      progress: newProgress,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_mission_date: new Date().toISOString(),
    })
    .eq("clerk_id", clerkId)
    .select();
}