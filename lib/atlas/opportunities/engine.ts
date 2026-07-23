import { Opportunity } from "./types";
import { OpportunityProfile } from "./profile";
import { matchOpportunities } from "./matcher";
import { recommend } from "./recommender";
import { fetchAllSources } from "./connectors";
import { filterOpportunities } from "./filter";

export async function discoverOpportunities(
  profile: OpportunityProfile
): Promise<Opportunity[]> {

  console.log(
    "Searching opportunities for:",
    profile.careerGoal
  );

  // Fetch every opportunity from every source
  const opportunities = await fetchAllSources();

  // Filter them using the user's North Star
  const filtered = filterOpportunities(
    opportunities,
    profile.careerGoal
  );

  // Match against skills and profile
  const matched = matchOpportunities(
    filtered,
    profile
  );

  // Rank the opportunities
  return recommend(matched);

}