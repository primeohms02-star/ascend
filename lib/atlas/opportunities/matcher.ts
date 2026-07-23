import { Opportunity } from "./types";
import { OpportunityProfile } from "./profile";

export function matchOpportunities(
  opportunities: Opportunity[],
  profile: OpportunityProfile
) {

  return opportunities.filter((opportunity) => {

    if (
      profile.remoteOnly &&
      !opportunity.remote
    ) {
      return false;
    }

    return true;
  });

}