import type { Opportunity } from "./types";

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function hasPersonalizedSnapshotScore(
  opportunity: Pick<Opportunity, "score" | "snapshotId">,
): opportunity is Pick<Opportunity, "score" | "snapshotId"> & {
  score: number;
  snapshotId: string;
} {
  return Boolean(opportunity.snapshotId) &&
    typeof opportunity.score === "number" &&
    Number.isFinite(opportunity.score);
}

export function resolveOpportunityMatchScore(
  opportunity: Pick<Opportunity, "score" | "snapshotId">,
  recalculatedScore: number | undefined,
): number {
  if (hasPersonalizedSnapshotScore(opportunity)) {
    return clampScore(opportunity.score);
  }

  return clampScore(
    typeof recalculatedScore === "number" && Number.isFinite(recalculatedScore)
      ? recalculatedScore
      : 50,
  );
}
