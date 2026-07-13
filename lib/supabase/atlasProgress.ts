import { supabase } from "./client";

export async function getProgress(userId: string) {
  const { data, error } = await supabase
    .from("atlas_progress")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!data || error) {
    const { data: created, error: createError } =
      await supabase
        .from("atlas_progress")
        .insert({
          user_id: userId,
          ascension_score: 0,
          level: 1,
        })
        .select()
        .single();

    if (createError) {
      console.error(createError);
      throw createError;
    }

    return created;
  }

  return data;
}

export async function addAscensionScore(
  userId: string,
  amount: number
) {
  const progress = await getProgress(userId);

  const newScore =
    progress.ascension_score + amount;

  let newLevel = progress.level;

  if (newScore >= 1000) newLevel = 5;
  else if (newScore >= 500) newLevel = 4;
  else if (newScore >= 250) newLevel = 3;
  else if (newScore >= 100) newLevel = 2;

  const { data, error } = await supabase
    .from("atlas_progress")
    .update({
      ascension_score: newScore,
      level: newLevel,
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}