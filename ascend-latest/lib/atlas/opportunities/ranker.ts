import { Opportunity } from "./types";

export function rankOpportunities(
  opportunities: Opportunity[]
) {
  return opportunities.sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0)
  );
}