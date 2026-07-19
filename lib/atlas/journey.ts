import { supabaseServer } from "@/lib/supabase-server";

export async function loadJourney(clerkId: string) {
  return await supabaseServer
    .from("profiles")
    .select("*")
    .eq("clerk_id", clerkId)
    .maybeSingle();
}

// Legacy functions retained so imports don't break.
// Journey steps are now handled by atlas_missions instead.

export async function addJourneyStep() {
  return null;
}

export async function completeJourneyStep() {
  return null;
}