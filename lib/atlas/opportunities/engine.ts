import { Opportunity } from "./types";
import { OpportunityProfile } from "./profile";
import { matchOpportunities } from "./matcher";
import { recommend } from "./recommender";
import { fetchAllSources } from "./connector";
import { filterOpportunities } from "./filter";
import { cacheOpportunities } from "./cache";

import { rankOpportunities } from "./intelligence";


export async function discoverOpportunities(
  profile: OpportunityProfile
): Promise<Opportunity[]> {

  console.log(
    "Searching opportunities for:",
    profile.careerGoal
  );

const opportunities = await fetchAllSources();
console.log("Fetched:", opportunities.length);

const filtered = filterOpportunities(opportunities, profile.careerGoal);

console.log("Remote Only:", profile.remoteOnly);
console.log(
  "Remote jobs:",
  filtered.filter(o => o.remote).length
);

console.log("Filtered:", filtered.length);

const matched = matchOpportunities(filtered, profile);
console.log("Matched:", matched.length);

const recommended = recommend(matched);
console.log("Recommended:", recommended.length);

const ranked = await rankOpportunities(recommended, profile);
console.log("Ranked:", ranked.length);
  await cacheOpportunities(
    profile.clerkId,
    ranked
  );

  return ranked;

}