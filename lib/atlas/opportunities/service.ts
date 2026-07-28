import { unstable_cache } from "next/cache";

import { buildOpportunityProfile } from "./build-profile";
import { discoverOpportunities } from "./engine";
import { recordImpression } from "./impressions";
import { rotateOpportunities } from "./rotation";

import type {
  RankedOpportunity,
} from "./types";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 25;

const SNAPSHOT_VERSION = "v3";

const SNAPSHOT_DURATION_SECONDS = 900;

const SNAPSHOT_DURATION_MS =
  SNAPSHOT_DURATION_SECONDS * 1000;

type MemorySnapshot = {
  opportunities: RankedOpportunity[];
  expiresAt: number;
};

const memorySnapshots = new Map<
  string,
  MemorySnapshot
>();

const snapshotRequests = new Map<
  string,
  Promise<RankedOpportunity[]>
>();

export type OpportunityPageOptions = {
  page?: number;
  limit?: number;
  search?: string;
  filter?: string;
};

export type OpportunityPageResult = {
  opportunities: RankedOpportunity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

function normalize(
  value?: string
): string {
  return (
    value?.trim().toLowerCase() ?? ""
  );
}

function getSnapshotKey(
  clerkId: string
): string {
  return `${SNAPSHOT_VERSION}:${clerkId}`;
}

function buildSearchableText(
  opportunity: RankedOpportunity
): string {
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

function isNigeriaOpportunity(
  opportunity: RankedOpportunity
): boolean {
  const searchable =
    buildSearchableText(opportunity);

  return (
    searchable.includes("nigeria") ||
    searchable.includes("nigerian")
  );
}

function isAfricaOpportunity(
  opportunity: RankedOpportunity
): boolean {
  const searchable =
    buildSearchableText(opportunity);

  const source =
    normalize(opportunity.source);

  return (
    isNigeriaOpportunity(opportunity) ||
    source === "opportunitydesk" ||
    source === "opportunityforafrica" ||
    searchable.includes("africa") ||
    searchable.includes("african")
  );
}

function matchesSearch(
  opportunity: RankedOpportunity,
  search?: string
): boolean {
  const query = normalize(search);

  if (!query) {
    return true;
  }

  return buildSearchableText(
    opportunity
  ).includes(query);
}

function matchesFilter(
  opportunity: RankedOpportunity,
  filter?: string
): boolean {
  const selectedFilter =
    normalize(filter);

  if (
    !selectedFilter ||
    selectedFilter === "all"
  ) {
    return true;
  }

  if (selectedFilter === "remote") {
    return opportunity.remote === true;
  }

  if (selectedFilter === "nigeria") {
    return isNigeriaOpportunity(
      opportunity
    );
  }

  if (selectedFilter === "africa") {
    return isAfricaOpportunity(
      opportunity
    );
  }

  const category =
    normalize(opportunity.category);

  const tags = (
    opportunity.tags ?? []
  ).map(normalize);

  return (
    category === selectedFilter ||
    tags.includes(selectedFilter)
  );
}

function orderForPagination(
  opportunities: RankedOpportunity[],
  pageSize: number
): RankedOpportunity[] {
  let remaining = [
    ...opportunities,
  ];

  const ordered:
    RankedOpportunity[] = [];

  while (remaining.length > 0) {
    const batchSize = Math.min(
      pageSize,
      remaining.length
    );

    const batch =
      rotateOpportunities(
        remaining,
        batchSize
      );

    if (batch.length === 0) {
      break;
    }

    ordered.push(...batch);

    const selectedKeys = new Set(
      batch.map(
        (opportunity) =>
          `${opportunity.source}:${opportunity.id}`
      )
    );

    remaining = remaining.filter(
      (opportunity) =>
        !selectedKeys.has(
          `${opportunity.source}:${opportunity.id}`
        )
    );
  }

  return ordered;
}

async function createOpportunitySnapshot(
  clerkId: string
): Promise<RankedOpportunity[]> {
  const loadPersistentSnapshot =
    unstable_cache(
      async () => {
        const opportunityProfile =
          await buildOpportunityProfile({
            clerkId,
          });

        const ranked =
          await discoverOpportunities(
            opportunityProfile
          );

        console.log(
          "Created opportunity snapshot:",
          ranked.length
        );

        return ranked;
      },
      [
        "atlas-opportunity-snapshot",
        SNAPSHOT_VERSION,
        clerkId,
      ],
      {
        revalidate:
          SNAPSHOT_DURATION_SECONDS,

        tags: [
          `atlas-opportunities-${clerkId}`,
        ],
      }
    );

  return loadPersistentSnapshot();
}

async function loadRankedOpportunities(
  clerkId: string
): Promise<RankedOpportunity[]> {
  const snapshotKey =
    getSnapshotKey(clerkId);

  const existingSnapshot =
    memorySnapshots.get(snapshotKey);

  if (
    existingSnapshot &&
    existingSnapshot.expiresAt >
      Date.now()
  ) {
    console.log(
      "Using memory opportunity snapshot:",
      existingSnapshot.opportunities.length
    );

    return (
      existingSnapshot.opportunities
    );
  }

  const existingRequest =
    snapshotRequests.get(snapshotKey);

  if (existingRequest) {
    console.log(
      "Joining existing opportunity snapshot request"
    );

    return existingRequest;
  }

  const snapshotRequest =
    createOpportunitySnapshot(clerkId)
      .then((opportunities) => {
        memorySnapshots.set(
          snapshotKey,
          {
            opportunities,

            expiresAt:
              Date.now() +
              SNAPSHOT_DURATION_MS,
          }
        );

        return opportunities;
      })
      .finally(() => {
        snapshotRequests.delete(
          snapshotKey
        );
      });

  snapshotRequests.set(
    snapshotKey,
    snapshotRequest
  );

  return snapshotRequest;
}

async function recordDisplayedOpportunities(
  clerkId: string,
  opportunities: RankedOpportunity[]
) {
  await Promise.allSettled(
    opportunities.map(
      (opportunity) =>
        recordImpression(
          clerkId,
          opportunity.id
        )
    )
  );
}

function recordDisplayedInBackground(
  clerkId: string,
  opportunities: RankedOpportunity[]
) {
  void recordDisplayedOpportunities(
    clerkId,
    opportunities
  ).catch((error) => {
    console.error(
      "Opportunity impression tracking failed:",
      error
    );
  });
}

export async function getPersonalizedOpportunities(
  profile: {
    clerkId: string;
  }
): Promise<RankedOpportunity[]> {
  const ranked =
    await loadRankedOpportunities(
      profile.clerkId
    );

  const recommendations =
    rotateOpportunities(
      ranked,
      DEFAULT_PAGE_SIZE
    );

  recordDisplayedInBackground(
    profile.clerkId,
    recommendations
  );

  return recommendations;
}

export async function getPersonalizedOpportunityPage(
  profile: {
    clerkId: string;
  },
  options: OpportunityPageOptions = {}
): Promise<OpportunityPageResult> {
  const requestedPage = Math.max(
    1,
    Math.floor(options.page ?? 1)
  );

  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(
      1,
      Math.floor(
        options.limit ??
          DEFAULT_PAGE_SIZE
      )
    )
  );

  const ranked =
    await loadRankedOpportunities(
      profile.clerkId
    );

  const filtered = ranked.filter(
    (opportunity) =>
      matchesSearch(
        opportunity,
        options.search
      ) &&
      matchesFilter(
        opportunity,
        options.filter
      )
  );

  const ordered =
    orderForPagination(
      filtered,
      pageSize
    );

  const total = ordered.length;

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize)
  );

  const page = Math.min(
    requestedPage,
    totalPages
  );

  const start =
    (page - 1) * pageSize;

  const opportunities =
    ordered.slice(
      start,
      start + pageSize
    );

  recordDisplayedInBackground(
    profile.clerkId,
    opportunities
  );

  return {
    opportunities,
    total,
    page,
    pageSize,
    totalPages,

    hasNextPage:
      page < totalPages,

    hasPreviousPage:
      page > 1,
  };
}