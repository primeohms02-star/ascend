import { supabase } from "./client";

export async function saveReflection(
  userId: string,
  reflection: string,
  confidence = 100
) {
  const { error } = await supabase
    .from("atlas_reflections")
    .insert({
      user_id: userId,
      reflection,
      confidence,
    });

  if (error) {
    console.error("Reflection save error:", error);
    throw error;
  }
}

export async function getReflections(userId: string) {
  const { data, error } = await supabase
    .from("atlas_reflections")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Reflection fetch error:", error);
    return [];
  }

  return data ?? [];
}