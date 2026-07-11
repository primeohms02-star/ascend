import { supabase } from "./client";

export async function createMission(
  userId: string,
  title?: string,
  description?: string
) {
  const { data, error } = await supabase
    .from("missions")
    .insert({
      user_id: userId,
      title: title ?? "Discover Your North Star",
      description:
        description ??
        "Spend 20 minutes thinking deeply about the person you want to become.",
    })
    .select()
    .single();

  if (error) {
    console.error("CREATE MISSION ERROR:", error);
    throw error;
  }

  return data;
}