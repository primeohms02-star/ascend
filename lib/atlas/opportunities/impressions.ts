import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function recordImpression(
  clerkId: string,
  opportunityId: string
) {
  const { data } = await supabase
    .from("atlas_opportunity_impressions")
    .select("*")
    .eq("clerk_id", clerkId)
    .eq("opportunity_id", opportunityId)
    .single();

  if (!data) {
    await supabase
      .from("atlas_opportunity_impressions")
      .insert({
        clerk_id: clerkId,
        opportunity_id: opportunityId,
        impressions: 1,
      });

    return;
  }

  await supabase
    .from("atlas_opportunity_impressions")
    .update({
      impressions: data.impressions + 1,
      last_seen: new Date().toISOString(),
    })
    .eq("id", data.id);
}