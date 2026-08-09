import { Opportunity } from "./types";
import { OpportunityProfile } from "./profile";

function isWorkOpportunity(
  opportunity: Opportunity
): boolean {
  const category =
    opportunity.category
      ?.trim()
      .toLowerCase() ?? "";

  return (
    category === "job" ||
    category === "internship"
  );
}

export function matchOpportunities(
  opportunities: Opportunity[],
  profile: OpportunityProfile
): Opportunity[] {
  if (!profile.remoteOnly) {
    return opportunities;
  }

  const hasRemoteWork =
    opportunities.some(
      (opportunity) =>
        isWorkOpportunity(opportunity) &&
        opportunity.remote === true
    );

  return opportunities.filter(
    (opportunity) => {
      // Remote preference only applies to jobs
      // and internships. It must never remove
      // scholarships, grants, fellowships,
      // competitions, courses or programmes.

      if (
        !isWorkOpportunity(opportunity)
      ) {
        return true;
      }

      // Preserve work opportunities when the
      // connectors found no remote alternatives.

      if (!hasRemoteWork) {
        return true;
      }

      return (
        opportunity.remote === true
      );
    }
  );
}