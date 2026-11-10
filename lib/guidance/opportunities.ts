import "server-only";
import { recordImpression } from "@/lib/atlas/opportunities/impressions";
import { getPersonalizedOpportunityPage } from "@/lib/atlas/opportunities/service";
import { supabaseAdmin } from "@/lib/supabase-admin";
export type { Pick } from "./picks";
import { pickForDirection, type Pick } from "./picks";
export async function getAtlasPicks(
  userId: string,
  displayed = false,
): Promise<Pick[]> {
  const page = await getPersonalizedOpportunityPage(
    { clerkId: userId },
    { page: 1, limit: 24, trackImpressions: false },
  );
  const ids = page.opportunities.map((x) => x.id);
  if (!ids.length) return [];
  const [decisions, hidden] = await Promise.all(
    ["atlas_opportunity_memory", "atlas_journey_hidden_listings"].map((table) =>
      supabaseAdmin
        .from(table)
        .select("opportunity_id")
        .eq("user_id", userId)
        .in("opportunity_id", ids)
        .abortSignal(AbortSignal.timeout(5000)),
    ),
  );
  if (decisions.error || hidden.error)
    throw Error("Unable to check prior decisions");
  const picks = pickForDirection(
    page,
    [...(decisions.data ?? []), ...(hidden.data ?? [])].map(
      (x) => x.opportunity_id,
    ),
  );
  if (displayed)
    void Promise.allSettled(picks.map((x) => recordImpression(userId, x.id)));
  return picks;
}
