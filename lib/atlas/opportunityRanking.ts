import { AdaptiveState } from "./adaptive";
import { Opportunity } from "@/lib/engine/opportunities";

export function rankOpportunities(
  opportunities: Opportunity[],
  adaptive: AdaptiveState
): Opportunity[] {
  return [...opportunities]
    .map((opportunity) => {
      let score = opportunity.score;

      switch (adaptive.opportunityFocus) {
        case "Learning":
          if (opportunity.category === "Course") {
            score += 30;
          }
          break;

        case "Career":
          if (opportunity.category === "Job") {
            score += 30;
          }
          break;

        case "Leadership":
          if (
            opportunity.category === "Accelerator" ||
            opportunity.category === "Scholarship"
          ) {
            score += 30;
          }
          break;
      }

      return {
        ...opportunity,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}