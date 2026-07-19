import { supabaseServer } from "@/lib/supabase-server";

export async function saveKnowledge(
  userId: string,
  category: string,
  fact: string,
  confidence: number
) {
  return await supabaseServer
    .from("atlas_knowledge")
    .insert({
      user_id: userId,
      category,
      fact,
      confidence,
    });
}

export async function loadKnowledge(
  userId: string
) {
  return await supabaseServer
    .from("atlas_knowledge")
    .select("*")
    .eq("user_id", userId)
    .order("confidence", {
      ascending: false,
    });
}

export async function updateKnowledge(
  id: string,
  fact: string,
  confidence: number
) {
  return await supabaseServer
    .from("atlas_knowledge")
    .update({
      fact,
      confidence,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}