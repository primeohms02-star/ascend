import { supabase } from "./client";

export async function getMemory(userId: string) {
  const { data } = await supabase
    .from("memory")
    .select("*")
    .eq("user_id", userId)
    .single();

  return data;
}