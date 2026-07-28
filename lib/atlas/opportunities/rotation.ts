import { Opportunity } from "./types";

function getCategory(
  opportunity: Opportunity
): string {
  return (
    opportunity.category
      ?.trim()
      .toLowerCase() || "other"
  );
}

function getSearchableLocation(
  opportunity: Opportunity
): string {
  return [
    opportunity.location,
    opportunity.title,
    opportunity.description,
    opportunity.source,
    ...(opportunity.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isNigerianOpportunity(
  opportunity: Opportunity
): boolean {
  const searchable =
    getSearchableLocation(opportunity);

  return (
    searchable.includes("nigeria") ||
    searchable.includes("nigerian")
  );
}

function isAfricanOpportunity(
  opportunity: Opportunity
): boolean {
  const searchable =
    getSearchableLocation(opportunity);

  const source =
    opportunity.source.toLowerCase();

  return (
    isNigerianOpportunity(opportunity) ||
    source === "opportunitydesk" ||
    source === "opportunityforafrica" ||
    searchable.includes("africa") ||
    searchable.includes("african")
  );
}

function selectDiverse<T extends Opportunity>(
  opportunities: T[],
  limit: number,
  selectedKeys: Set<string>
): T[] {
  if (limit <= 0) {
    return [];
  }

  const groups = new Map<string, T[]>();

  for (const opportunity of opportunities) {
    const key =
      `${opportunity.source}:${opportunity.id}`;

    if (selectedKeys.has(key)) {
      continue;
    }

    const category =
      getCategory(opportunity);

    const group =
      groups.get(category) ?? [];

    group.push(opportunity);

    groups.set(category, group);
  }

  for (const group of groups.values()) {
    group.sort(
      (a, b) =>
        (b.score ?? 0) -
        (a.score ?? 0)
    );
  }

  const categories = Array.from(
    groups.keys()
  ).sort((a, b) => {
    const firstA =
      groups.get(a)?.[0]?.score ?? 0;

    const firstB =
      groups.get(b)?.[0]?.score ?? 0;

    return firstB - firstA;
  });

  const selected: T[] = [];

  let addedInRound = true;

  while (
    selected.length < limit &&
    addedInRound
  ) {
    addedInRound = false;

    for (const category of categories) {
      if (selected.length >= limit) {
        break;
      }

      const group = groups.get(category);

      const opportunity = group?.shift();

      if (!opportunity) {
        continue;
      }

      const key =
        `${opportunity.source}:${opportunity.id}`;

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

export function rotateOpportunities<
  T extends Opportunity
>(
  opportunities: T[],
  limit = 10
): T[] {
  if (limit <= 0) {
    return [];
  }

  const ranked = [...opportunities].sort(
    (a, b) =>
      (b.score ?? 0) -
      (a.score ?? 0)
  );

  if (ranked.length <= limit) {
    return ranked;
  }

  const selectedKeys =
    new Set<string>();

  const selected: T[] = [];

  const nigerian =
    ranked.filter(
      isNigerianOpportunity
    );

  const african =
    ranked.filter(
      (opportunity) =>
        isAfricanOpportunity(opportunity) &&
        !isNigerianOpportunity(opportunity)
    );

  const global =
    ranked.filter(
      (opportunity) =>
        !isAfricanOpportunity(opportunity)
    );

  // Aim for at least three Nigerian
  // opportunities when enough exist.

  selected.push(
    ...selectDiverse(
      nigerian,
      Math.min(3, limit),
      selectedKeys
    )
  );

  // Aim for at least 60% African
  // opportunities, including Nigeria.

  const africanTarget =
    Math.ceil(limit * 0.6);

  selected.push(
    ...selectDiverse(
      african,
      Math.max(
        0,
        africanTarget - selected.length
      ),
      selectedKeys
    )
  );

  // Fill remaining positions with diverse
  // globally accessible opportunities.

  selected.push(
    ...selectDiverse(
      global,
      limit - selected.length,
      selectedKeys
    )
  );

  // If any regional pool was too small,
  // fill all remaining positions from the
  // complete ranked collection.

  selected.push(
    ...selectDiverse(
      ranked,
      limit - selected.length,
      selectedKeys
    )
  );

  return selected.slice(0, limit);
}