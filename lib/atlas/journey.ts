import { supabaseServer } from "@/lib/supabase-server";

export async function loadJourney(
  clerkId: string
) {
  return await supabaseServer
    .from("journey")
    .select("*")
    .eq("clerk_id", clerkId)
    .order("created_at", {
      ascending: true,
    });
}

export async function addJourneyStep(
  clerkId: string,
  title: string,
  description: string
) {
  return await supabaseServer
    .from("journey")
    .insert({
      clerk_id: clerkId,
      title,
      description,
      completed: false,
    });
}

export async function completeJourneyStep(
  id: string
) {
  return await supabaseServer
    .from("journey")
    .update({
      completed: true,
    })
    .eq("id", id);
}