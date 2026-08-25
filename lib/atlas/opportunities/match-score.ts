import type { Opportunity } from "./types";

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function resolveOpportunityMatchScore(
  opportunity: Pick<Opportunity, "score" | "snapshotId">,
  recalculatedScore: number | undefined,
): number {
  const snapshotScore = opportunity.score;

  if (
    opportunity.snapshotId &&
    typeof snapshotScore === "number" &&
    Number.isFinite(snapshotScore)
  ) {
    return clampScore(snapshotScore);
  }

  return clampScore(
    typeof recalculatedScore === "number" && Number.isFinite(recalculatedScore)
      ? recalculatedScore
      : 50,
  );
}
