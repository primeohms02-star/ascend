import { supabase } from "./client";

export async function getMissions(userId: string) {
  const { data } = await supabase
    .from("atlas_missions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at");

  return data ?? [];
}