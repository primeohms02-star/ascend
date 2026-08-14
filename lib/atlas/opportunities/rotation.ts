import {
  getAfricanCountry,
  getNigerianState,
  isAfricanOpportunity,
  isNigerianOpportunity,
} from "./geography";

import type { Opportunity } from "./types";

function getCategory(opportunity: Opportunity): string {
  return opportunity.category?.trim().toLowerCase() || "other";
}

function getOpportunityKey(opportunity: Opportunity): string {
  return `${opportunity.source}:${opportunity.id}`;
}

function getRegionalGroup(opportunity: Opportunity): string {
  if (isNigerianOpportunity(opportunity)) {
    return `nigeria:${getNigerianState(opportunity) ?? "state-unspecified"}`;
  }

  if (isAfricanOpportunity(opportunity)) {
    return `africa:${getAfricanCountry(opportunity) ?? "country-unspecified"}`;
  }

  return `global:${getCategory(opportunity)}`;
}

function selectGrouped<T extends Opportunity>(
  opportunities: T[],
  limit: number,
  selectedKeys: Set<string>,
  getGroup: (opportunity: T) => string,
): T[] {
  if (limit <= 0) {
    return [];
  }

  const groups = new Map<string, T[]>();

  for (const opportunity of opportunities) {
    if (selectedKeys.has(getOpportunityKey(opportunity))) {
      continue;
    }

    const groupName = getGroup(opportunity);
    const group = groups.get(groupName) ?? [];

    group.push(opportunity);
    groups.set(groupName, group);
  }

  for (const group of groups.values()) {
    group.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  const groupNames = Array.from(groups.keys()).sort((a, b) => {
    const firstA = groups.get(a)?.[0]?.score ?? 0;
    const firstB = groups.get(b)?.[0]?.score ?? 0;

    return firstB - firstA;
  });

  const selected: T[] = [];
  let addedInRound = true;

  while (selected.length < limit && addedInRound) {
    addedInRound = false;

    for (const groupName of groupNames) {
      if (selected.length >= limit) {
        break;
      }

      const opportunity = groups.get(groupName)?.shift();

      if (!opportunity) {
        continue;
      }

      const key = getOpportunityKey(opportunity);

      if (selectedKeys.has(key)) {
        continue;
      }

      selected.push(opportunity);
      selectedKeys.add(key);
      addedInRound = true;
    }
  }

  return selected;
}

export function rotateOpportunities<T extends Opportunity>(
  opportunities: T[],
  limit = 10,
): T[] {
  if (limit <= 0) {
    return [];
  }

  const ranked = [...opportunities].sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0),
  );

  if (ranked.length <= limit) {
    return ranked;
  }

  const selectedKeys = new Set<string>();
  const selected: T[] = [];
  const nigerian = ranked.filter(isNigerianOpportunity);
  const african = ranked.filter(
    (opportunity) =>
      isAfricanOpportunity(opportunity) &&
      !isNigerianOpportunity(opportunity),
  );
  const global = ranked.filter(
    (opportunity) => !isAfricanOpportunity(opportunity),
  );

  // Reserve 40% of a typical page for Nigeria and round-robin by state.
  // Lagos and Abuja can still rank highly, but cannot consume every slot
  // when credible opportunities from other states are available.
  const nigerianTarget = Math.min(limit, Math.ceil(limit * 0.4));

  selected.push(
    ...selectGrouped(
      nigerian,
      nigerianTarget,
      selectedKeys,
      (opportunity) => getNigerianState(opportunity) ?? "state-unspecified",
    ),
  );

  // Keep at least 70% of the page Africa-focused when the source pool allows
  // it, while rotating the non-Nigerian portion across different countries.
  const africanTarget = Math.ceil(limit * 0.7);

  selected.push(
    ...selectGrouped(
      african,
      Math.max(0, africanTarget - selected.length),
      selectedKeys,
      (opportunity) => getAfricanCountry(opportunity) ?? "country-unspecified",
    ),
  );

  // Globally accessible opportunities remain useful and are balanced by type.
  selected.push(
    ...selectGrouped(
      global,
      limit - selected.length,
      selectedKeys,
      (opportunity) => getCategory(opportunity),
    ),
  );

  // Fill any shortfall using the complete ranked pool, still round-robin by
  // state, African country, or global category instead of raw source order.
  selected.push(
    ...selectGrouped(
      ranked,
      limit - selected.length,
      selectedKeys,
      (opportunity) => getRegionalGroup(opportunity),
    ),
  );

  return selected.slice(0, limit);
}
