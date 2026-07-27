import { Opportunity } from "./types";
import { OpportunityProfile } from "./profile";

export function matchOpportunities(
  opportunities: Opportunity[],
  profile: OpportunityProfile
) {
  // If there are no remote jobs at all, don't filter everything out.
  const hasRemoteJobs = opportunities.some(o => o.remote);

  return opportunities.filter((opportunity) => {
    if (
      profile.remoteOnly &&
      hasRemoteJobs &&
      !opportunity.remote
    ) {
      return false;
    }

    return true;
  });
}