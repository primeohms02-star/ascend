import { supabase } from "@/lib/supabase";

import { RankedOpportunity } from "./types";

export async function cacheOpportunities(
  clerkId: string,
  opportunities: RankedOpportunity[]
) {

  if (!opportunities.length) return;

  const rows = opportunities.map((o) => ({
    ...o,
    clerk_id: clerkId,
  }));

  await supabase
    .from("atlas_opportunity_cache")
    .upsert(rows);

}

export async function getCachedOpportunities(
  clerkId: string
) {

  const { data } = await supabase
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

  const { data } = await supabase
    .from("atlas_opportunity_cache")
    .select("*")
    .eq("clerk_id", clerkId)
    .eq("id", id)
    .single();

  return data as RankedOpportunity | null;

}