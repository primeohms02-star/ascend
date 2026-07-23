import { Opportunity } from "./types";

export function deduplicateOpportunities(
  opportunities: Opportunity[]
): Opportunity[] {

  const seen = new Set<string>();

  return opportunities.filter((opportunity) => {

    const key = `${opportunity.company}-${opportunity.title}`.toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;

  });

}