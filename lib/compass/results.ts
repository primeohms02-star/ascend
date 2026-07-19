import { supabaseServer } from "@/lib/supabase-server";

export async function loadCompassResults(
  clerkId: string
) {
  return await supabaseServer
    .from("compass_results")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();
}

export async function saveCompassResults(
  clerkId: string,
  results: {
    answers: any;
    direction: string;
    north_star: string;
    next_step: string;
  }
) {
  return await supabaseServer
    .from("compass_results")
    .upsert(
      {
        clerk_id: clerkId,
        answers: results.answers,
        direction: results.direction,
        north_star: results.north_star,
        next_step: results.next_step,
      },
      {
        onConflict: "clerk_id",
      }
    );
}