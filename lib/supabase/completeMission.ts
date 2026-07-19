import { supabase } from "./client";

export async function completeMission(
  missionId: string
) {
  const { data, error } = await supabase
    .from("atlas_missions")
   .update({
  status: "completed",
  completed_at: new Date().toISOString(),
})
    .eq("id", missionId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}