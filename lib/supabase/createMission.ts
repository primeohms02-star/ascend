import { supabase } from "./client";

export async function createMission(
  userId: string,
  title?: string,
  description?: string
) {
  const { data, error } = await supabase
    .from("atlas_missions")
   .insert({
  user_id: userId,
  mission:
    title ?? "Discover Your North Star",

  reason:
    description ??
    "Spend 20 minutes thinking deeply about the person you want to become.",

  status: "active",
})
    .select()
    .single();

  if (error) {
    console.error("CREATE MISSION ERROR:", error);
    throw error;
  }

  return data;
}