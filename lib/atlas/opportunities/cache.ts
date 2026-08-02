import { supabaseAdmin } from "@/lib/supabase-admin";

import { RankedOpportunity } from "./types";

export async function cacheOpportunities(
  clerkId: string,
  opportunities: RankedOpportunity[]
) {
  if (!opportunities.length) return;

  const rows = opportunities.map((opportunity) => ({
    ...opportunity,
    clerk_id: clerkId,
  }));

  await supabaseAdmin
    .from("atlas_opportunity_cache")
    .upsert(rows);
}

export async function getCachedOpportunities(
  clerkId: string
) {
  const { data } = await supabaseAdmin
    .from("atlas_opportunity_cache")
    .select("*")
    .eq("clerk_id", clerkId)
    .order("score", {
      ascending: false,
    });

  return (data ?? []) as RankedOpportunity[];
}

export async function getCachedOpportunity(
  clerkId: string,
  id: string
) {
  const { data } = await supabaseAdmin
    .from("atlas_opportunity_cache")
    .select("*")
    .eq("clerk_id", clerkId)
    .eq("id", id)
    .single();

  return data as RankedOpportunity | null;
}