import { supabaseServer } from "@/lib/supabase-server";

export async function recordImpression(
  clerkId: string,
  opportunityId: string
) {
  const { data } = await supabaseServer
    .from("atlas_opportunity_impressions")
    .select("*")
    .eq("clerk_id", clerkId)
    .eq("opportunity_id", opportunityId)
    .single();

  if (!data) {
    await supabaseServer
      .from("atlas_opportunity_impressions")
      .insert({
        clerk_id: clerkId,
        opportunity_id: opportunityId,
        impressions: 1,
      });

    return;
  }

  await supabaseServer
    .from("atlas_opportunity_impressions")
    .update({
      impressions:
        (data.impressions ?? 0) + 1,
      last_seen: new Date().toISOString(),
    })
    .eq("id", data.id);
}