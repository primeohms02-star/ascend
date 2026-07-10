import { supabase } from "./client";

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}