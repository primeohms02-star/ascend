import { revalidateTag, unstable_cache } from "next/cache";

import { buildOpportunityProfile } from "./build-profile";

import { discoverOpportunities } from "./engine";

import { recordImpression } from "./impressions";

import { rotateOpportunities } from "./rotation";

import {
  getOpportunityLocationPriority,
  resolveOpportunityLocation,
} from "./location";

import type {
  OpportunityLocationSelection,
  ResolvedOpportunityLocation,
} from "./location";

import type { OpportunityProfile } from "./profile";

import type { RankedOpportunity } from "./types";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 25;

const SNAPSHOT_VERSION = "v15";

const SNAPSHOT_WINDOW_SECONDS = 900;

const SNAPSHOT_WINDOW_MS = SNAPSHOT_WINDOW_SECONDS * 1000;

const SNAPSHOT_RETENTION_SECONDS = 86_400;

const SNAPSHOT_RETENTION_MS = SNAPSHOT_RETENTION_SECONDS * 1000;

const SNAPSHOT_RETENTION_WINDOWS = Math.ceil(
  SNAPSHOT_RETENTION_SECONDS / SNAPSHOT_WINDOW_SECONDS,
);

type OpportunitySnapshot = {
  opportunities: RankedOpportunity[];

  profile: OpportunityProfile;
};

type MemorySnapshot = {
  snapshot: OpportunitySnapshot;

  expiresAt: number;
};

type SnapshotOpportunity = RankedOpportunity & {
  snapshotId?: string;
};

const memorySnapshots = new Map<string, MemorySnapshot>();

const snapshotRequests = new Map<string, Promise<OpportunitySnapshot>>();

export type OpportunityPageOptions = {
  page?: number;

  limit?: number;

  search?: string;

  filter?: string;

  location?: OpportunityLocationSelection;
};

export type OpportunityPageResult = {
  opportunities: RankedOpportunity[];

  profile: OpportunityProfile;

  total: number;

  page: number;

  pageSize: number;

  totalPages: number;

  hasNextPage: boolean;

  hasPreviousPage: boolean;

  snapshotId: string;

  location: ResolvedOpportunityLocation;
};

function normalize(value?: string): string {
  return value?.trim().toLowerCase() ?? "";
}

function getCurrentSnapshotId(): string {
  return String(Math.floor(Date.now() / SNAPSHOT_WINDOW_MS));
}

function normalizeSnapshotId(value?: string): string | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value.trim(), 10);

  const current = Number.parseInt(getCurrentSnapshotId(), 10);

  if (
    !Number.isSafeInteger(parsed) ||
    String(parsed) !== value.trim() ||
    parsed > current + 1 ||
    current - parsed > SNAPSHOT_RETENTION_WINDOWS
  ) {
    return null;
  }

  return String(parsed);
}

function getSnapshotKey(clerkId: string, snapshotId: string): string {
  return `${SNAPSHOT_VERSION}:${clerkId}:${snapshotId}`;
}

function getSnapshotTag(clerkId: string): string {
  return `atlas-opportunities-${clerkId}`;
}

function pruneExpiredMemorySnapshots() {
  const now = Date.now();

  for (const [key, memorySnapshot] of memorySnapshots) {
    if (memorySnapshot.expiresAt <= now) {
      memorySnapshots.delete(key);
    }
  }
}

export function invalidateOpportunitySnapshot(clerkId: string) {
  const snapshotPrefix = `${SNAPSHOT_VERSION}:${clerkId}:`;

  for (const key of memorySnapshots.keys()) {
    if (key.startsWith(snapshotPrefix)) {
      memorySnapshots.delete(key);
    }
  }

  revalidateTag(getSnapshotTag(clerkId), {
    expire: 0,
  });
}

function buildSearchableText(opportunity: RankedOpportunity): string {
  return [
    opportunity.title,
    opportunity.company,
    opportunity.description,
    opportunity.category,
    opportunity.location,
    opportunity.source,
    ...(opportunity.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isNigeriaOpportunity(opportunity: RankedOpportunity): boolean {
  const searchable = buildSearchableText(opportunity);

  return searchable.includes("nigeria") || searchable.includes("nigerian");
}

function isAfricaOpportunity(opportunity: RankedOpportunity): boolean {
  const searchable = buildSearchableText(opportunity);

  const source = normalize(opportunity.source);

  return (
    isNigeriaOpportunity(opportunity) ||
    source === "opportunitydesk" ||
    source === "opportunityforafrica" ||
    source === "opportunitiesforafricans" ||
    source === "musicinafrica" ||
    source === "trybeafrica" ||
    source === "fatefoundation" ||
    source === "nigeriafinance" ||
    source === "africanfashionfoundation" ||
    searchable.includes("africa") ||
    searchable.includes("african")
  );
}

function matchesSearch(
  opportunity: RankedOpportunity,
  search?: string,
): boolean {
  const query = normalize(search);

  if (!query) {
    return true;
  }

  return buildSearchableText(opportunity).includes(query);
}

function matchesFilter(
  opportunity: RankedOpportunity,
  filter?: string,
): boolean {
  const selectedFilter = normalize(filter);

  if (!selectedFilter || selectedFilter === "all") {
    return true;
  }

  if (selectedFilter === "remote") {
    return opportunity.remote === true;
  }

  if (selectedFilter === "nigeria") {
    return isNigeriaOpportunity(opportunity);
  }

  if (selectedFilter === "africa") {
    return isAfricaOpportunity(opportunity);
  }

  const category = normalize(opportunity.category);

  const tags = (opportunity.tags ?? []).map(normalize);

  return category === selectedFilter || tags.includes(selectedFilter);
}

function orderForPagination(
  opportunities: RankedOpportunity[],
  pageSize: number,
): RankedOpportunity[] {
  let remaining = [...opportunities];

  const ordered: RankedOpportunity[] = [];

  while (remaining.length > 0) {
    const batchSize = Math.min(pageSize, remaining.length);

    const batch = rotateOpportunities(remaining, batchSize);

    if (batch.length === 0) {
      break;
    }

    ordered.push(...batch);

    const selectedKeys = new Set(
      batch.map((opportunity) => `${opportunity.source}:${opportunity.id}`),
    );

    remaining = remaining.filter(
      (opportunity) =>
        !selectedKeys.has(`${opportunity.source}:${opportunity.id}`),
    );
  }

  return ordered;
}

function orderForLocationPagination(
  opportunities: RankedOpportunity[],
  pageSize: number,
  location: ResolvedOpportunityLocation,
  filter?: string,
): RankedOpportunity[] {
  if (!location.active || normalize(filter) === "remote") {
    return orderForPagination(opportunities, pageSize);
  }

  const buckets = new Map<number, RankedOpportunity[]>([
    [3, []],
    [2, []],
    [1, []],
  ]);

  for (const opportunity of opportunities) {
    const priority = getOpportunityLocationPriority(opportunity, location);

    if (priority > 0) {
      buckets.get(priority)?.push(opportunity);
    }
  }

  return [3, 2, 1].flatMap((priority) =>
    orderForPagination(buckets.get(priority) ?? [], pageSize),
  );
}

async function createOpportunitySnapshot(
  clerkId: string,
  snapshotId: string,
): Promise<OpportunitySnapshot> {
  const loadPersistentSnapshot = unstable_cache(
    async () => {
      const opportunityProfile = await buildOpportunityProfile({
        clerkId,
      });

      const ranked = await discoverOpportunities(opportunityProfile);

      console.log("Created opportunity snapshot:", snapshotId, ranked.length);

      return {
        opportunities: ranked,

        profile: opportunityProfile,
      };
    },
    ["atlas-opportunity-snapshot", SNAPSHOT_VERSION, clerkId, snapshotId],
    {
      revalidate: SNAPSHOT_RETENTION_SECONDS,

      tags: [getSnapshotTag(clerkId)],
    },
  );

  return loadPersistentSnapshot();
}

async function loadOpportunitySnapshot(
  clerkId: string,
  requestedSnapshotId?: string,
): Promise<OpportunitySnapshot> {
  pruneExpiredMemorySnapshots();

  const snapshotId =
    normalizeSnapshotId(requestedSnapshotId) ?? getCurrentSnapshotId();

  const snapshotKey = getSnapshotKey(clerkId, snapshotId);

  const existingSnapshot = memorySnapshots.get(snapshotKey);

  if (existingSnapshot && existingSnapshot.expiresAt > Date.now()) {
    console.log(
      "Using memory opportunity snapshot:",
      snapshotId,
      existingSnapshot.snapshot.opportunities.length,
    );

    return existingSnapshot.snapshot;
  }

  const existingRequest = snapshotRequests.get(snapshotKey);

  if (existingRequest) {
    console.log("Joining existing opportunity snapshot request:", snapshotId);

    return existingRequest;
  }

  const snapshotRequest = createOpportunitySnapshot(clerkId, snapshotId)
    .then((snapshot) => {
      memorySnapshots.set(snapshotKey, {
        snapshot,

        expiresAt: Date.now() + SNAPSHOT_RETENTION_MS,
      });

      return snapshot;
    })
    .finally(() => {
      snapshotRequests.delete(snapshotKey);
    });

  snapshotRequests.set(snapshotKey, snapshotRequest);

  return snapshotRequest;
}

async function recordDisplayedOpportunities(
  clerkId: string,
  opportunities: RankedOpportunity[],
) {
  await Promise.allSettled(
    opportunities.map((opportunity) =>
      recordImpression(clerkId, opportunity.id),
    ),
  );
}

function recordDisplayedInBackground(
  clerkId: string,
  opportunities: RankedOpportunity[],
) {
  void recordDisplayedOpportunities(clerkId, opportunities).catch((error) => {
    console.error("Opportunity impression tracking failed:", error);
  });
}

function findOpportunityInSnapshot(
  snapshot: OpportunitySnapshot,
  id: string,
  source: string,
): RankedOpportunity | null {
  const opportunityId = id.trim();

  const opportunitySource = normalize(source);

  return (
    snapshot.opportunities.find(
      (opportunity) =>
        opportunity.id === opportunityId &&
        normalize(opportunity.source) === opportunitySource,
    ) ?? null
  );
}

export async function getPersonalizedOpportunities(profile: {
  clerkId: string;
}): Promise<RankedOpportunity[]> {
  const snapshotId = getCurrentSnapshotId();

  const snapshot = await loadOpportunitySnapshot(profile.clerkId, snapshotId);

  const recommendations = rotateOpportunities(
    snapshot.opportunities,
    DEFAULT_PAGE_SIZE,
  ).map((opportunity) => ({
    ...opportunity,
    snapshotId,
  }));

  recordDisplayedInBackground(profile.clerkId, recommendations);

  return recommendations;
}

export async function getPersonalizedOpportunityById(
  clerkId: string,
  id: string,
  source: string,
  requestedSnapshotId?: string,
): Promise<RankedOpportunity | null> {
  const currentSnapshotId = getCurrentSnapshotId();

  const selectedSnapshotId = normalizeSnapshotId(requestedSnapshotId);

  const snapshotIds = selectedSnapshotId
    ? [
        selectedSnapshotId,
        ...(selectedSnapshotId === currentSnapshotId
          ? []
          : [currentSnapshotId]),
      ]
    : [currentSnapshotId, String(Number.parseInt(currentSnapshotId, 10) - 1)];

  for (const snapshotId of snapshotIds) {
    const snapshot = await loadOpportunitySnapshot(clerkId, snapshotId);

    const opportunity = findOpportunityInSnapshot(snapshot, id, source);

    if (opportunity) {
      return opportunity;
    }
  }

  return null;
}

export async function getPersonalizedOpportunityPage(
  profile: {
    clerkId: string;
  },
  options: OpportunityPageOptions = {},
): Promise<OpportunityPageResult> {
  const requestedPage = Math.max(1, Math.floor(options.page ?? 1));

  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(options.limit ?? DEFAULT_PAGE_SIZE)),
  );

  const snapshotId = getCurrentSnapshotId();

  const snapshot = await loadOpportunitySnapshot(profile.clerkId, snapshotId);

  const filteredByCriteria = snapshot.opportunities.filter(
    (opportunity) =>
      matchesSearch(opportunity, options.search) &&
      matchesFilter(opportunity, options.filter),
  );

  const location = resolveOpportunityLocation(
    options.location ?? { mode: "profile" },
    snapshot.profile,
  );

  const ordered = orderForLocationPagination(
    filteredByCriteria,
    pageSize,
    location,
    options.filter,
  );

  const total = ordered.length;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const page = Math.min(requestedPage, totalPages);

  const start = (page - 1) * pageSize;

  const opportunities: SnapshotOpportunity[] = ordered
    .slice(start, start + pageSize)
    .map((opportunity) => ({
      ...opportunity,
      snapshotId,
    }));

  recordDisplayedInBackground(profile.clerkId, opportunities);

  return {
    opportunities,

    profile: snapshot.profile,

    total,

    page,

    pageSize,

    totalPages,

    hasNextPage: page < totalPages,

    hasPreviousPage: page > 1,

    snapshotId,

    location,
  };
}
