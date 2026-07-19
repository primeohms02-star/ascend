import { supabaseServer } from "@/lib/supabase-server";

export async function loadCurrentMission(clerkId: string) {
  const { data } = await supabaseServer
    .from("atlas_missions")
    .select("*")
    .eq("user_id", clerkId)
    .eq("status", "active")
    .single();

  return data;
}

export async function completeMission(id: string) {
  return await supabaseServer
    .from("atlas_missions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function createMission(
  clerkId: string,
  mission: string,
  reason: string
) {
  // Complete any existing active mission
  await supabaseServer
    .from("atlas_missions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("user_id", clerkId)
    .eq("status", "active");

  // Create the new mission
  return await supabaseServer
    .from("atlas_missions")
    .insert({
      user_id: clerkId,
      mission,
      reason,
      status: "active",
    })
    .select();
}