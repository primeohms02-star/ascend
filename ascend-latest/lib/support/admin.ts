import {
  supabaseServer,
} from "@/lib/supabase-server";

import type {
  SupportCase,
  SupportCaseStatus,
  SupportCategory,
  SupportDiagnosis,
  SupportEvidence,
  SupportMessage,
  SupportUrgency,
} from "./types";

type SupportCaseRow = {
  id: string;
  reference_number: string;
  user_id: string | null;
  contact_email: string | null;
  category: SupportCategory;
  urgency: SupportUrgency;
  status: SupportCaseStatus;
  title: string;
  initial_message: string;
  diagnosis: SupportDiagnosis;
  conversation: SupportMessage[];
  suggested_actions: string[];
  evidence: SupportEvidence[];
  current_path: string | null;
  browser: string | null;
  resolution: string | null;
  assigned_to: string | null;
  escalated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SupportCaseFilters = {
  status?: SupportCaseStatus | "all";
  category?: SupportCategory | "all";
  urgency?: SupportUrgency | "all";
  search?: string;
  limit?: number;
};

export type SupportCaseUpdate = {
  status?: SupportCaseStatus;
  resolution?: string | null;
  assignedTo?: string | null;
};

function mapSupportCase(
  value: unknown
): SupportCase {
  const row =
    value as SupportCaseRow;

  return {
    id: row.id,

    referenceNumber:
      row.reference_number,

    userId:
      row.user_id,

    contactEmail:
      row.contact_email,

    category:
      row.category,

    urgency:
      row.urgency,

    status:
      row.status,

    title:
      row.title,

    initialMessage:
      row.initial_message,

    diagnosis:
      row.diagnosis,

    conversation:
      Array.isArray(
        row.conversation
      )
        ? row.conversation
        : [],

    suggestedActions:
      Array.isArray(
        row.suggested_actions
      )
        ? row.suggested_actions
        : [],

    evidence:
      Array.isArray(
        row.evidence
      )
        ? row.evidence
        : [],

    currentPath:
      row.current_path,

    browser:
      row.browser,

    resolution:
      row.resolution,

    assignedTo:
      row.assigned_to,

    escalatedAt:
      row.escalated_at,

    resolvedAt:
      row.resolved_at,

    closedAt:
      row.closed_at,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

function sanitizeSearch(
  value?: string
): string {
  return (
    value
      ?.trim()
      .replace(
        /[%(),]/g,
        ""
      )
      .slice(0, 100) ??
    ""
  );
}

export async function listSupportCases({
  status = "all",
  category = "all",
  urgency = "all",
  search,
  limit = 100,
}: SupportCaseFilters = {}): Promise<
  SupportCase[]
> {
  const safeLimit =
    Math.max(
      1,
      Math.min(limit, 200)
    );

  let query =
    supabaseServer
      .from(
        "ascend_support_cases"
      )
      .select("*")
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(safeLimit);

  if (status !== "all") {
    query =
      query.eq(
        "status",
        status
      );
  }

  if (
    category !== "all"
  ) {
    query =
      query.eq(
        "category",
        category
      );
  }

  if (
    urgency !== "all"
  ) {
    query =
      query.eq(
        "urgency",
        urgency
      );
  }

  const normalizedSearch =
    sanitizeSearch(search);

  if (normalizedSearch) {
    query =
      query.or(
        [
          `reference_number.ilike.%${normalizedSearch}%`,
          `title.ilike.%${normalizedSearch}%`,
          `initial_message.ilike.%${normalizedSearch}%`,
          `contact_email.ilike.%${normalizedSearch}%`,
        ].join(",")
      );
  }

  const {
    data,
    error,
  } = await query;

  if (error) {
    console.error(
      "Support admin list error:",
      error
    );

    throw new Error(
      "ASCEND could not load support cases."
    );
  }

  return (
    data ?? []
  ).map(mapSupportCase);
}

export async function getAdminSupportCase(
  id: string
): Promise<SupportCase | null> {
  const normalizedId =
    id.trim();

  if (!normalizedId) {
    return null;
  }

  const {
    data,
    error,
  } =
    await supabaseServer
      .from(
        "ascend_support_cases"
      )
      .select("*")
      .eq(
        "id",
        normalizedId
      )
      .maybeSingle();

  if (error) {
    console.error(
      "Support admin case lookup error:",
      error
    );

    throw new Error(
      "ASCEND could not retrieve the support case."
    );
  }

  return data
    ? mapSupportCase(data)
    : null;
}

export async function updateSupportCase(
  id: string,
  update: SupportCaseUpdate
): Promise<SupportCase> {
  const normalizedId =
    id.trim();

  if (!normalizedId) {
    throw new Error(
      "A support case ID is required."
    );
  }

  const now =
    new Date().toISOString();

  const values: {
    status?: SupportCaseStatus;
    resolution?: string | null;
    assigned_to?: string | null;
    resolved_at?: string | null;
    closed_at?: string | null;
    updated_at: string;
  } = {
    updated_at: now,
  };

  if (update.status) {
    values.status =
      update.status;

    if (
      update.status ===
      "resolved"
    ) {
      values.resolved_at =
        now;

      values.closed_at =
        null;
    } else if (
      update.status ===
      "closed"
    ) {
      values.closed_at =
        now;
    } else {
      values.resolved_at =
        null;

      values.closed_at =
        null;
    }
  }

  if (
    update.resolution !==
    undefined
  ) {
    const resolution =
      update.resolution
        ?.trim()
        .slice(0, 5000);

    values.resolution =
      resolution || null;
  }

  if (
    update.assignedTo !==
    undefined
  ) {
    const assignedTo =
      update.assignedTo
        ?.trim()
        .slice(0, 200);

    values.assigned_to =
      assignedTo || null;
  }

  const {
    data,
    error,
  } =
    await supabaseServer
      .from(
        "ascend_support_cases"
      )
      .update(values)
      .eq(
        "id",
        normalizedId
      )
      .select("*")
      .single();

  if (error || !data) {
    console.error(
      "Support case update error:",
      error
    );

    throw new Error(
      "ASCEND could not update the support case."
    );
  }

  return mapSupportCase(
    data
  );
}