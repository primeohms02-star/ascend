export const OPPORTUNITY_SNAPSHOT_SEPARATOR = "~ascend-snapshot~";

export type OpportunityReference = {
  opportunityId: string;
  snapshotId: string;
};

export function createOpportunityRouteId(
  opportunityId: string,
  snapshotId?: string,
): string {
  const cleanOpportunityId = opportunityId.trim();
  const cleanSnapshotId = snapshotId?.trim() ?? "";

  if (!/^\d+$/.test(cleanSnapshotId)) {
    return cleanOpportunityId;
  }

  return `${cleanOpportunityId}${OPPORTUNITY_SNAPSHOT_SEPARATOR}${cleanSnapshotId}`;
}

export function parseOpportunityRouteId(value: string): OpportunityReference {
  const routeId = value.trim();
  const separatorIndex = routeId.lastIndexOf(OPPORTUNITY_SNAPSHOT_SEPARATOR);

  if (separatorIndex <= 0) {
    return {
      opportunityId: routeId,
      snapshotId: "",
    };
  }

  const snapshotId = routeId
    .slice(separatorIndex + OPPORTUNITY_SNAPSHOT_SEPARATOR.length)
    .trim();

  if (!/^\d+$/.test(snapshotId)) {
    return {
      opportunityId: routeId,
      snapshotId: "",
    };
  }

  return {
    opportunityId: routeId.slice(0, separatorIndex).trim(),
    snapshotId,
  };
}
