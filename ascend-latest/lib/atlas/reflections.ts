import {
  supabaseServer,
} from "@/lib/supabase-server";

export async function saveReflection(
  userId: string,
  reflection: string,
  confidence: number
) {
  const cleanReflection =
    reflection.trim();

  if (!cleanReflection) {
    throw new Error(
      "A reflection is required."
    );
  }

  const safeConfidence =
    Math.max(
      0,
      Math.min(
        5,
        Number.isFinite(confidence)
          ? confidence
          : 0
      )
    );

  const { data, error } =
    await supabaseServer
      .from("atlas_reflections")
      .insert({
        user_id: userId,
        reflection:
          cleanReflection,
        confidence:
          safeConfidence,
      })
      .select()
      .single();

  if (error) {
    console.error(
      "Atlas Reflection Save Error:",
      error
    );

    throw error;
  }

  return data;
}

export async function loadLatestReflection(
  userId: string
) {
  const { data, error } =
    await supabaseServer
      .from("atlas_reflections")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

  if (error) {
    console.error(
      "Latest Reflection Load Error:",
      error
    );

    throw error;
  }

  return data ?? null;
}