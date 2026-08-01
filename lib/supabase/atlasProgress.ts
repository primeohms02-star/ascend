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
      .eq(
        "user_id",
        userId
      )
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
   * The canonical completion transaction creates the
   * stored record when XP is first awarded.
   */
  if (!data) {
    const initial =
      calculateAscension(0);

    return {
      user_id:
        userId,

      ascension_score:
        initial.score,

      level:
        initial.level,
    };
  }

  const ascension =
    calculateAscension(
      Number(
        data.ascension_score ??
          0
      )
    );

  return {
    user_id:
      data.user_id,

    ascension_score:
      ascension.score,

    /*
     * The derived level remains authoritative even
     * if an older stored level needs repair.
     */
    level:
      ascension.level,

    updated_at:
      data.updated_at ??
      undefined,
  };
}