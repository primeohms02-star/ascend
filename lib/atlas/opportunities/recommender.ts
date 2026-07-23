import { Opportunity } from "./types";

export function recommend(
  opportunities: Opportunity[]
) {

  return opportunities
    .sort(
      (a, b) =>
        (b.score ?? 0) -
        (a.score ?? 0)
    )
    .slice(0, 10);

}