import { RankedOpportunity } from "./types";
import { OpportunityProfile } from "./profile";
import { matchOpportunities } from "./matcher";
import { recommend } from "./recommender";
import { fetchAllSources } from "./connector";
import { filterOpportunities } from "./filter";
import { rankOpportunities } from "./intelligence";

export async function discoverOpportunities(
  profile: OpportunityProfile
): Promise<RankedOpportunity[]> {
  console.log(
    "Searching opportunities for:",
    profile.careerGoal
  );

  const opportunities =
    await fetchAllSources();

  console.log(
    "Fetched:",
    opportunities.length
  );

  const filtered =
    filterOpportunities(
      opportunities,
      profile.careerGoal
    );

  console.log(
    "Filtered:",
    filtered.length
  );

  const matched =
    matchOpportunities(
      filtered,
      profile
    );

  console.log(
    "Matched:",
    matched.length
  );

  const recommended =
    recommend(matched);

  console.log(
    "Recommended:",
    recommended.length
  );

  const ranked =
    await rankOpportunities(
      recommended,
      profile
    );

  console.log(
    "Ranked:",
    ranked.length
  );

  // Do not block the opportunity feed by writing
  // every full description into Supabase here.
  // The complete ranked collection is maintained
  // by the server snapshot in service.ts.

  return ranked;
}