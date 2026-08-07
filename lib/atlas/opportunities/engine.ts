import { unstable_cache } from "next/cache";

import type {
  RankedOpportunity,
} from "./types";

import type {
  OpportunityProfile,
} from "./profile";

import {
  matchOpportunities,
} from "./matcher";

import {
  recommend,
} from "./recommender";

import {
  fetchAllSources,
} from "./connector";

import {
  filterOpportunities,
} from "./filter";

import {
  rankOpportunities,
} from "./intelligence";

/*
 * Opportunity source data is public and identical for every user.
 * Cache the expensive connector sweep once and keep personalization
 * (filtering, matching and ranking) user-specific.
 */
const loadOpportunitySources = unstable_cache(
  async () => fetchAllSources(),
  [
    "atlas-opportunity-sources",
    "v1",
  ],
  {
    revalidate: 300,
  }
);

export async function discoverOpportunities(
  profile:
    OpportunityProfile
): Promise<
  RankedOpportunity[]
> {
  console.log(
    "Searching opportunities for:",
    profile.careerGoal
  );

  const opportunities =
    await loadOpportunitySources();

  console.log(
    "Fetched:",
    opportunities.length
  );

  const filtered =
    filterOpportunities(
      opportunities,
      profile
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
    recommend(
      matched
    );

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

  /*
   * Do not block the opportunity feed by
   * writing every description into Supabase.
   *
   * The complete ranked collection is
   * maintained by the server snapshot.
   */

  return ranked;
}