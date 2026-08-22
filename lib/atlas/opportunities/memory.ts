import { supabaseServer } from "@/lib/supabase-server";
import type { Json } from "@/lib/database.types";

import type { Opportunity } from "./types";

export type OpportunityStatus =
  | "saved"
  | "applied"
  | "interview"
  | "completed"
  | "accepted"
  | "rejected"
  | "ignored";

export type OpportunityLibraryCategory =
  | "saved"
  | "applied"
  | "completed";

export type OpportunityMemoryRecord = {
  id?: string;
  user_id: string;
  opportunity_id: string;
  source: string;
  title: string;
  company: string;
  status: OpportunityStatus;
  created_at?: string;
  updated_at?: string;
};

const TEXT_LIMITS = {
  id: 500,
  title: 500,
  company: 300,
  description: 16_000,
  summary: 4_000,
  shortText: 500,
  url: 2_000,
  listItem: 1_000,
} as const;

function cleanText(value: unknown, maximumLength: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const clean = value.trim().slice(0, maximumLength);
  return clean || undefined;
}

function cleanList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, TEXT_LIMITS.listItem))
    .filter(Boolean)
    .slice(0, 50);

  return items.length > 0 ? items : undefined;
}

function cleanOpportunityForMemory(value: unknown): Opportunity | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Partial<Opportunity>;
  const id = cleanText(candidate.id, TEXT_LIMITS.id);
  const title = cleanText(candidate.title, TEXT_LIMITS.title);
  const company = cleanText(candidate.company, TEXT_LIMITS.company);
  const source = cleanText(candidate.source, TEXT_LIMITS.shortText);

  if (!id || !title || !company || !source) {
    return null;
  }

  const tags = cleanList(candidate.tags) ?? [];
  const url = cleanText(candidate.url, TEXT_LIMITS.url);
  const safeUrl = url && /^https?:\/\//i.test(url) ? url : undefined;

  return {
    id,
    title,
    company,
    source,
    tags,
    snapshotId: cleanText(candidate.snapshotId, TEXT_LIMITS.shortText),
    description: cleanText(candidate.description, TEXT_LIMITS.description),
    summary: cleanText(candidate.summary, TEXT_LIMITS.summary),
    responsibilities: cleanList(candidate.responsibilities),
    requirements: cleanList(candidate.requirements),
    benefits: cleanList(candidate.benefits),
    employmentType: cleanText(candidate.employmentType, TEXT_LIMITS.shortText),
    category: cleanText(candidate.category, TEXT_LIMITS.shortText),
    location: cleanText(candidate.location, TEXT_LIMITS.shortText),
    remote: candidate.remote === true,
    salary: cleanText(candidate.salary, TEXT_LIMITS.shortText),
    deadline: cleanText(candidate.deadline, TEXT_LIMITS.shortText),
    url: safeUrl,
    score:
      typeof candidate.score === "number" && Number.isFinite(candidate.score)
        ? candidate.score
        : undefined,
  };
}

export type OpportunityLibraryCounts = {
  saved: number;
  applied: number;
  completed: number;
};

const CATEGORY_STATUSES: Record<
  OpportunityLibraryCategory,
  OpportunityStatus[]
> = {
  saved: ["saved"],
  applied: ["applied", "interview"],
  completed: [
    "completed",
    "accepted",
    "rejected",
  ],
};

const OPPORTUNITY_MEMORY_COLUMNS =
  "id,user_id,opportunity_id,source,title,company,status,created_at,updated_at";

export async function saveOpportunity(
  userId: string,
  opportunity: Opportunity,
  status: OpportunityStatus = "saved"
) {
  const storedOpportunity = cleanOpportunityForMemory(opportunity);

  if (!storedOpportunity) {
    throw new Error("Opportunity data could not be stored safely.");
  }

  return supabaseServer
    .from("atlas_opportunity_memory")
    .upsert(
      {
        user_id: userId,
        opportunity_id: storedOpportunity.id,
        source: storedOpportunity.source,
        title: storedOpportunity.title,
        company: storedOpportunity.company,
        opportunity_data: storedOpportunity as unknown as Json,
        status,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,opportunity_id",
      }
    );
}

export async function getStoredOpportunityData(
  userId: string,
  opportunityId: string,
  source: string,
): Promise<Opportunity | null> {
  const { data, error } = await supabaseServer
    .from("atlas_opportunity_memory")
    .select("opportunity_data")
    .eq("user_id", userId)
    .eq("opportunity_id", opportunityId)
    .eq("source", source)
    .maybeSingle();

  if (error) {
    console.error("Get Stored Opportunity Data Error:", error);
    return null;
  }

  return cleanOpportunityForMemory(data?.opportunity_data);
}

export async function getStoredOpportunitySummary(
  userId: string,
  opportunityId: string,
  source: string,
): Promise<Opportunity | null> {
  const { data, error } = await supabaseServer
    .from("atlas_opportunity_memory")
    .select("opportunity_id,source,title,company")
    .eq("user_id", userId)
    .eq("opportunity_id", opportunityId)
    .eq("source", source)
    .maybeSingle();

  if (error) {
    console.error("Get Stored Opportunity Summary Error:", error);
    return null;
  }

  if (!data?.title || !data.company || !data.source) {
    return null;
  }

  return {
    id: data.opportunity_id,
    title: data.title,
    company: data.company,
    source: data.source,
    tags: [],
    description:
      "ASCEND retained this opportunity in your Library, but the original source no longer exposes its complete details. Atlas can still help you evaluate the saved title and organisation.",
  };
}

export async function updateOpportunityStatus(
  userId: string,
  opportunityId: string,
  status: OpportunityStatus
) {
  return supabaseServer
    .from("atlas_opportunity_memory")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("opportunity_id", opportunityId);
}


export async function getOpportunityStatus(
  userId: string,
  opportunityId: string
): Promise<OpportunityStatus | null> {
  const { data, error } = await supabaseServer
    .from("atlas_opportunity_memory")
    .select("status")
    .eq("user_id", userId)
    .eq("opportunity_id", opportunityId)
    .maybeSingle();

  if (error) {
    console.error("Get Opportunity Status Error:", error);
    return null;
  }

  return data?.status ? (data.status as OpportunityStatus) : null;
}

export async function removeSavedOpportunity(
  userId: string,
  opportunityId: string
) {
  return supabaseServer
    .from("atlas_opportunity_memory")
    .delete()
    .eq("user_id", userId)
    .eq("opportunity_id", opportunityId)
    .eq("status", "saved");
}

export async function getOpportunityStatuses(
  userId: string,
  opportunityIds: string[]
): Promise<Record<string, OpportunityStatus>> {
  const uniqueIds = [
    ...new Set(
      opportunityIds
        .map((id) => id.trim())
        .filter(Boolean)
    ),
  ];

  if (uniqueIds.length === 0) {
    return {};
  }

  const { data, error } = await supabaseServer
    .from("atlas_opportunity_memory")
    .select("opportunity_id,status")
    .eq("user_id", userId)
    .in("opportunity_id", uniqueIds);

  if (error) {
    console.error("Get Opportunity Statuses Error:", error);
    return {};
  }

  return Object.fromEntries(
    (data ?? []).map((item) => [
      item.opportunity_id,
      item.status as OpportunityStatus,
    ])
  );
}

export async function getOpportunityMemory(
  userId: string
): Promise<OpportunityMemoryRecord[]> {
  const { data, error } = await supabaseServer
    .from("atlas_opportunity_memory")
    .select(OPPORTUNITY_MEMORY_COLUMNS)
    .eq("user_id", userId)
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Get Opportunity Memory Error:",
      error
    );

    return [];
  }

  return (data ?? []) as OpportunityMemoryRecord[];
}

export async function getOpportunitiesByCategory(
  userId: string,
  category: OpportunityLibraryCategory
): Promise<OpportunityMemoryRecord[]> {
  const statuses = CATEGORY_STATUSES[category];

  const { data, error } = await supabaseServer
    .from("atlas_opportunity_memory")
    .select(OPPORTUNITY_MEMORY_COLUMNS)
    .eq("user_id", userId)
    .in("status", statuses)
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      `Get ${category} Opportunities Error:`,
      error
    );

    return [];
  }

  return (data ?? []) as OpportunityMemoryRecord[];
}

export async function getOpportunityLibraryCounts(
  userId: string
): Promise<OpportunityLibraryCounts> {
  const [
    savedResult,
    appliedResult,
    completedResult,
  ] = await Promise.all([
    supabaseServer
      .from("atlas_opportunity_memory")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", userId)
      .in("status", CATEGORY_STATUSES.saved),

    supabaseServer
      .from("atlas_opportunity_memory")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", userId)
      .in("status", CATEGORY_STATUSES.applied),

    supabaseServer
      .from("atlas_opportunity_memory")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", userId)
      .in(
        "status",
        CATEGORY_STATUSES.completed
      ),
  ]);

  if (savedResult.error) {
    console.error(
      "Count Saved Opportunities Error:",
      savedResult.error
    );
  }

  if (appliedResult.error) {
    console.error(
      "Count Applied Opportunities Error:",
      appliedResult.error
    );
  }

  if (completedResult.error) {
    console.error(
      "Count Completed Opportunities Error:",
      completedResult.error
    );
  }

  return {
    saved: savedResult.count ?? 0,
    applied: appliedResult.count ?? 0,
    completed: completedResult.count ?? 0,
  };
}

/**
 * Kept for compatibility with existing ASCEND files.
 * Despite its original name, the earlier function returned every
 * opportunity stored in Atlas memory.
 */
export async function getSavedOpportunities(
  userId: string
): Promise<OpportunityMemoryRecord[]> {
  return getOpportunityMemory(userId);
}
