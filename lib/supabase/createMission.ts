import { supabase } from "./client";

export async function createMission(userId: string) {
  const { data, error } = await supabase
    .from("missions")
    .insert({
      user_id: userId,
      title: "Discover Your North Star",
      description:
        "Spend 20 minutes thinking deeply about the person you want to become.",
      completed: false,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}