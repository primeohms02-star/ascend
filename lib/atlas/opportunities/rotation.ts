import { Opportunity } from "./types";

export function rotateOpportunities(
  opportunities: Opportunity[],
  limit = 5
): Opportunity[] {

  if (opportunities.length <= limit) {
    return opportunities;
  }

  const grouped = new Map<number, Opportunity[]>();

  for (const opportunity of opportunities) {

    const bucket =
      Math.floor((opportunity.score ?? 0) / 5);

    if (!grouped.has(bucket)) {
      grouped.set(bucket, []);
    }

    grouped.get(bucket)!.push(opportunity);

  }

  const buckets = [...grouped.keys()]
    .sort((a, b) => b - a);

  const result: Opportunity[] = [];

  for (const bucket of buckets) {

    const items = grouped.get(bucket)!;

    items.sort(() => Math.random() - 0.5);

    for (const item of items) {

      if (result.length >= limit) {
        break;
      }

      result.push(item);

    }

    if (result.length >= limit) {
      break;
    }

  }

  return result;

}