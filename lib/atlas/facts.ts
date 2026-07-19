import { supabaseServer } from "@/lib/supabase-server";

export async function saveFact(
  userId: string,
  fact: string
) {
  return await supabaseServer
    .from("atlas_facts")
    .insert({
      user_id: userId,
      fact,
    });
}

export async function loadFacts(
  userId: string
) {
  return await supabaseServer
    .from("atlas_facts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: true,
    });
}