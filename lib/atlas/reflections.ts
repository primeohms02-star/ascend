import { supabaseServer } from "@/lib/supabase-server";

export async function saveReflection(
  userId: string,
  reflection: string,
  confidence: number
) {
  return await supabaseServer
    .from("atlas_reflections")
    .insert({
      user_id: userId,
      reflection,
      confidence,
    });
}

export async function loadLatestReflection(
  userId: string
) {
  return await supabaseServer
    .from("atlas_reflections")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .single();
}