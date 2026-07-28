import { Opportunity } from "./types";

export function recommend(
  opportunities: Opportunity[]
): Opportunity[] {
  // Do not limit results here.
  //
  // Atlas must rank the complete candidate pool
  // before rotation chooses the final ten.
  //
  // Limiting here would unfairly favor whichever
  // connectors happen to finish or appear first.

  return [...opportunities];
}