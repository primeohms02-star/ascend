import { supabase } from "./client";

import { calculateAscension } from "@/lib/atlas/ascension";

export type AtlasProgressRecord = {
  user_id: string;
  ascension_score: number;
  level: number;
  updated_at?: string;
};

export async function getProgress(
  userId: string
): Promise<AtlasProgressRecord> {
  const { data, error } = await supabase
    .from("atlas_progress")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      "Get Atlas Progress Error:",
      error
    );

    throw error;
  }

  if (data) {
    const ascension =
      calculateAscension(
        Number(data.ascension_score ?? 0)
      );

    /*
     * Repair an old or inconsistent stored level.
     */
    if (
      Number(data.level ?? 1) !==
      ascension.level
    ) {
      const { data: repaired, error: repairError } =
        await supabase
          .from("atlas_progress")
          .update({
            level: ascension.level,
            updated_at:
              new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select()
          .single();

      if (repairError) {
        console.error(
          "Repair Atlas Level Error:",
          repairError
        );

        throw repairError;
      }

      return repaired as AtlasProgressRecord;
    }

    return data as AtlasProgressRecord;
  }

  const initialAscension =
    calculateAscension(0);

  const { data: created, error: createError } =
    await supabase
      .from("atlas_progress")
      .insert({
        user_id: userId,
        ascension_score:
          initialAscension.score,
        level: initialAscension.level,
        updated_at:
          new Date().toISOString(),
      })
      .select()
      .single();

  if (createError) {
    console.error(
      "Create Atlas Progress Error:",
      createError
    );

    throw createError;
  }

  return created as AtlasProgressRecord;
}

export async function addAscensionScore(
  userId: string,
  amount: number
): Promise<AtlasProgressRecord> {
  const progress =
    await getProgress(userId);

  const safeAmount = Math.max(
    0,
    Math.round(
      Number.isFinite(amount) ? amount : 0
    )
  );

  const newScore =
    Number(progress.ascension_score ?? 0) +
    safeAmount;

  const ascension =
    calculateAscension(newScore);

  const { data, error } = await supabase
    .from("atlas_progress")
    .update({
      ascension_score: ascension.score,
      level: ascension.level,
      updated_at:
        new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error(
      "Add Ascension Score Error:",
      error
    );

    throw error;
  }

  return data as AtlasProgressRecord;
}