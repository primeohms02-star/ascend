import {
  supabaseServer,
} from "@/lib/supabase-server";

import {
  calculateAscension,
} from "@/lib/atlas/ascension";

export type AtlasProgressRecord = {
  user_id: string;
  ascension_score: number;
  level: number;
  updated_at?: string;
};

export async function getProgress(
  userId: string
): Promise<AtlasProgressRecord> {
  const { data, error } =
    await supabaseServer
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

  /*
   * Context loading is read-only.
   * A missing record is represented safely in memory.
   * The atomic mission-completion function creates
   * the stored record when XP is first awarded.
   */
  if (!data) {
    const initial =
      calculateAscension(0);

    return {
      user_id: userId,
      ascension_score:
        initial.score,
      level:
        initial.level,
    };
  }

  const ascension =
    calculateAscension(
      Number(
        data.ascension_score ?? 0
      )
    );

  return {
    user_id:
      data.user_id,

    ascension_score:
      ascension.score,

    /*
     * Derived level is authoritative even if an old
     * stored level has not yet been repaired.
     */
    level:
      ascension.level,

    updated_at:
      data.updated_at ??
      undefined,
  };
}

/*
 * Retained only for compatibility with older code.
 * Mission XP must normally be awarded through the
 * atomic complete_atlas_mission database function.
 */
export async function addAscensionScore(
  userId: string,
  amount: number
): Promise<AtlasProgressRecord> {
  const progress =
    await getProgress(userId);

  const safeAmount =
    Math.max(
      0,
      Math.round(
        Number.isFinite(amount)
          ? amount
          : 0
      )
    );

  const ascension =
    calculateAscension(
      progress.ascension_score +
        safeAmount
    );

  const { data, error } =
    await supabaseServer
      .from("atlas_progress")
      .upsert(
        {
          user_id: userId,
          ascension_score:
            ascension.score,
          level:
            ascension.level,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "user_id",
        }
      )
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