import { supabase } from "./client";

export async function saveReflection(
  userId: string,
  missionId: string,
  reflection: string,
  mood: number
) {
  const { data, error } = await supabase
    .from("atlas_reflections")
    .insert({
      user_id: userId,
      mission_id: missionId,
      reflection,
      mood,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getReflections(
  userId: string
) {
  const { data, error } = await supabase
    .from("atlas_reflections")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) return [];

  return data;
}