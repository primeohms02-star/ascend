import { Opportunity } from "./types";
import { CareerOpportunityMap } from "./careerMap";

export function filterOpportunities(
  opportunities: Opportunity[],
  northStar: string
): Opportunity[] {

  const normalizedNorthStar =
    northStar.trim().toLowerCase();

  const keywords =
    CareerOpportunityMap[normalizedNorthStar] ?? [];

  if (keywords.length === 0) {
    return opportunities;
  }

  return opportunities.filter((opportunity) => {

    const searchable = [
      opportunity.title,
      opportunity.description,
      ...(opportunity.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();

    return keywords.some((keyword) =>
      searchable.includes(keyword.toLowerCase())
    );

  });

}