import type { OpportunityProfile } from "./profile";
import type { RankedOpportunity } from "./types";

import {
  getAfricanCountry,
  getNigerianState,
  inferAfricanCountry,
  inferNigerianState,
} from "./geography";

export type OpportunityLocationMode =
  | "all"
  | "profile"
  | "manual"
  | "current";

export type OpportunityLocationSelection = {
  mode?: OpportunityLocationMode;
  query?: string;
  city?: string;
  region?: string;
  country?: string;
};

export type ResolvedOpportunityLocation = {
  mode: OpportunityLocationMode;
  query: string;
  city: string;
  region: string;
  country: string;
  label: string;
  active: boolean;
};

function clean(value?: string): string {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function normalize(value?: string): string {
  return clean(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key = normalize(value);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function parseLocationQuery(query: string) {
  const parts = unique(
    query
      .split(",")
      .map(clean)
      .filter(Boolean),
  );

  if (parts.length >= 3) {
    return {
      city: parts[0],
      region: parts.slice(1, -1).join(", "),
      country: parts.at(-1) ?? "",
    };
  }

  if (parts.length === 2) {
    return {
      city: parts[0],
      region: "",
      country: parts[1],
    };
  }

  return {
    city: "",
    region: "",
    country: "",
  };
}

export function resolveOpportunityLocation(
  selection: OpportunityLocationSelection,
  profile: OpportunityProfile,
): ResolvedOpportunityLocation {
  const mode = selection.mode ?? "profile";

  if (mode === "all") {
    return {
      mode,
      query: "",
      city: "",
      region: "",
      country: "",
      label: "All locations",
      active: false,
    };
  }

  const query = clean(
    mode === "profile" ? profile.location : selection.query,
  );

  const parsed = parseLocationQuery(query);
  const city = clean(selection.city) || parsed.city;
  const region = clean(selection.region) || parsed.region;
  const country = clean(selection.country) || parsed.country;
  const label = unique([city, region, country]).join(", ") || query;

  return {
    mode,
    query,
    city,
    region,
    country,
    label,
    active: Boolean(query || city || region || country),
  };
}

function searchableLocation(opportunity: RankedOpportunity): string {
  return normalize(
    [
      opportunity.location,
      ...(opportunity.tags ?? []),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function includesLocation(text: string, value: string): boolean {
  const normalizedValue = normalize(value);

  return Boolean(normalizedValue) && text.includes(normalizedValue);
}

export function getOpportunityLocationPriority(
  opportunity: RankedOpportunity,
  location: ResolvedOpportunityLocation,
): number {
  if (!location.active) {
    return 1;
  }

  const searchable = searchableLocation(opportunity);

  if (!searchable) {
    return 0;
  }

  if (location.city && includesLocation(searchable, location.city)) {
    return 3;
  }

  if (location.region && includesLocation(searchable, location.region)) {
    return 2;
  }

  if (location.country && includesLocation(searchable, location.country)) {
    return 1;
  }

  if (location.query && includesLocation(searchable, location.query)) {
    return 3;
  }

  const requestedLocation = [
    location.city,
    location.region,
    location.country,
    location.query,
  ]
    .filter(Boolean)
    .join(" ");

  const requestedState = inferNigerianState(requestedLocation);
  const opportunityState = getNigerianState(opportunity);

  if (requestedState && requestedState === opportunityState) {
    return 3;
  }

  const requestedCountry = inferAfricanCountry(requestedLocation);
  const opportunityCountry = getAfricanCountry(opportunity);

  if (requestedCountry && requestedCountry === opportunityCountry) {
    return 2;
  }

  const queryParts = unique(
    location.query
      .split(/[,/|]/)
      .map(clean)
      .filter(Boolean),
  );

  for (let index = 0; index < queryParts.length; index += 1) {
    if (includesLocation(searchable, queryParts[index])) {
      return Math.max(1, 3 - index);
    }
  }

  return 0;
}
