import { supabase } from "./client";

export async function saveAtlasMemory(
  userId: string,
  role: string,
  message: string
) {
  const { error } = await supabase
    .from("atlas_memory")
    .insert({
      user_id: userId,
      role,
      message,
    });

  if (error) {
    console.error("ATLAS MEMORY ERROR:", error);
    throw error;
  }
}

export async function getAtlasMemory(
  userId: string
) {
  const { data, error } = await supabase
    .from("atlas_memory")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}