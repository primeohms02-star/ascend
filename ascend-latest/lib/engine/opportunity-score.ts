export function calculateOpportunityScore(
  journeyMatch: number,
  skillMatch: number,
  goalMatch: number,
  locationMatch: number,
  timingMatch: number
) {
  return (
    journeyMatch * 0.35 +
    skillMatch * 0.25 +
    goalMatch * 0.20 +
    locationMatch * 0.10 +
    timingMatch * 0.10
  );
}