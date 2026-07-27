import { supabase } from "@/lib/supabase";

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
    "ignored",
  ],
};

export async function saveOpportunity(
  userId: string,
  opportunity: Opportunity,
  status: OpportunityStatus = "saved"
) {
  return supabase
    .from("atlas_opportunity_memory")
    .upsert(
      {
        user_id: userId,
        opportunity_id: opportunity.id,
        source: opportunity.source,
        title: opportunity.title,
        company: opportunity.company,
        status,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,opportunity_id",
      }
    );
}

export async function updateOpportunityStatus(
  userId: string,
  opportunityId: string,
  status: OpportunityStatus
) {
  return supabase
    .from("atlas_opportunity_memory")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("opportunity_id", opportunityId);
}

export async function getOpportunityMemory(
  userId: string
): Promise<OpportunityMemoryRecord[]> {
  const { data, error } = await supabase
    .from("atlas_opportunity_memory")
    .select("*")
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

  const { data, error } = await supabase
    .from("atlas_opportunity_memory")
    .select("*")
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
    supabase
      .from("atlas_opportunity_memory")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", userId)
      .in("status", CATEGORY_STATUSES.saved),

    supabase
      .from("atlas_opportunity_memory")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", userId)
      .in("status", CATEGORY_STATUSES.applied),

    supabase
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