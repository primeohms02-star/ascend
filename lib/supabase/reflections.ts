import {
  supabaseServer,
} from "@/lib/supabase-server";

export async function saveReflection(
  userId: string,
  missionId: string,
  reflection: string,
  mood: number
) {
  const cleanReflection =
    reflection.trim();

  if (!cleanReflection) {
    throw new Error(
      "A reflection is required."
    );
  }

  const safeMood =
    Math.max(
      1,
      Math.min(
        5,
        Math.round(
          Number.isFinite(mood)
            ? mood
            : 3
        )
      )
    );

  const { data, error } =
    await supabaseServer
      .from("atlas_reflections")
      .insert({
        user_id: userId,

        mission_id:
          typeof missionId ===
            "string" &&
          missionId.trim()
            ? missionId.trim()
            : null,

        reflection:
          cleanReflection,

        mood:
          safeMood,
      })
      .select()
      .single();

  if (error) {
    console.error(
      "Reflection Save Error:",
      error
    );

    throw error;
  }

  return data;
}

export async function getReflections(
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
      .limit(100);

  if (error) {
    console.error(
      "Reflections Load Error:",
      error
    );

    throw error;
  }

  return data ?? [];
}