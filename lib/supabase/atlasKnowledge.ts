import { supabase } from "./client";

export async function saveKnowledge(
  userId: string,
  category: string,
  fact: string,
  confidence = 100
) {
  const { error } = await supabase
    .from("atlas_knowledge")
    .insert({
      user_id: userId,
      category,
      fact,
      confidence,
    });

  if (error) {
    console.error("Knowledge save error:", error);
    throw error;
  }
}

export async function getKnowledge(userId: string) {
  const { data, error } = await supabase
    .from("atlas_knowledge")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}