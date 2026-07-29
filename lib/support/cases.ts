import { randomUUID } from "crypto";

import { supabaseServer } from "@/lib/supabase-server";

import { notifySupportAdminsOfNewCase } from "./notifications";

import type {
  CreateSupportCaseRequest,
  SupportCase,
  SupportCaseStatus,
  SupportCategory,
  SupportDiagnosis,
  SupportEvidence,
  SupportMessage,
  SupportUrgency,
} from "./types";

type CreateCaseOptions = {
  userId?: string | null;
  request: CreateSupportCaseRequest;
};

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

function normalizeEmail(
  value?: string | null
): string | null {
  const email =
    value
      ?.trim()
      .toLowerCase();

  return email || null;
}

function createReferenceNumber(): string {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const identifier =
    randomUUID()
      .replace(/-/g, "")
      .slice(0, 6)
      .toUpperCase();

  return `ASC-${date}-${identifier}`;
}

function mapSupportCase(
  data: unknown
): SupportCase {
  const row =
    data as SupportCaseRow;

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

async function findRecentDuplicateCase({
  userId,
  contactEmail,
  category,
}: {
  userId?: string | null;
  contactEmail?: string | null;
  category: SupportCategory;
}): Promise<SupportCase | null> {
  if (
    !userId &&
    !contactEmail
  ) {
    return null;
  }

  const duplicateWindow =
    new Date(
      Date.now() -
        15 * 60 * 1000
    ).toISOString();

  if (userId) {
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
          "user_id",
          userId
        )
        .eq(
          "category",
          category
        )
        .in("status", [
          "open",
          "investigating",
          "waiting_for_user",
        ])
        .gte(
          "created_at",
          duplicateWindow
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(1)
        .maybeSingle();

    if (error) {
      console.error(
        "Support duplicate lookup error:",
        error
      );

      throw new Error(
        "Support could not check for an existing case."
      );
    }

    return data
      ? mapSupportCase(data)
      : null;
  }

  if (contactEmail) {
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
          "contact_email",
          contactEmail
        )
        .eq(
          "category",
          category
        )
        .in("status", [
          "open",
          "investigating",
          "waiting_for_user",
        ])
        .gte(
          "created_at",
          duplicateWindow
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(1)
        .maybeSingle();

    if (error) {
      console.error(
        "Support duplicate lookup error:",
        error
      );

      throw new Error(
        "Support could not check for an existing case."
      );
    }

    return data
      ? mapSupportCase(data)
      : null;
  }

  return null;
}

export async function createSupportCase({
  userId,
  request,
}: CreateCaseOptions): Promise<{
  supportCase: SupportCase;
  duplicate: boolean;
}> {
  const contactEmail =
    normalizeEmail(
      request.contactEmail
    );

  if (
    !userId &&
    !contactEmail
  ) {
    throw new Error(
      "Sign in or provide a contact email before escalating this issue."
    );
  }

  const duplicate =
    await findRecentDuplicateCase({
      userId,

      contactEmail,

      category:
        request.diagnosis
          .category,
    });

  if (duplicate) {
    console.log(
      "Support notification skipped because the case is a recent duplicate:",
      duplicate.referenceNumber
    );

    return {
      supportCase:
        duplicate,

      duplicate: true,
    };
  }

  const referenceNumber =
    createReferenceNumber();

  const conversation =
    request.conversation.slice(
      -20
    );

  const suggestedActions =
    request.suggestedActions.slice(
      0,
      10
    );

  const evidence = (
    request.evidence ?? []
  ).slice(0, 10);

  const {
    data,
    error,
  } =
    await supabaseServer
      .from(
        "ascend_support_cases"
      )
      .insert({
        reference_number:
          referenceNumber,

        user_id:
          userId ?? null,

        contact_email:
          contactEmail,

        category:
          request.diagnosis
            .category,

        urgency:
          request.diagnosis
            .urgency,

        status: "open",

        title:
          request.diagnosis
            .title,

        initial_message:
          request.initialMessage,

        diagnosis:
          request.diagnosis,

        conversation,

        suggested_actions:
          suggestedActions,

        evidence,

        current_path:
          request.currentPath ??
          null,

        browser:
          request.browser ??
          null,

        escalated_at:
          new Date()
            .toISOString(),
      })
      .select("*")
      .single();

  if (
    error ||
    !data
  ) {
    console.error(
      "Support case creation error:",
      error
    );

    throw new Error(
      "ASCEND could not create the support case."
    );
  }

  const supportCase =
    mapSupportCase(data);

  console.log(
    "New support case created:",
    supportCase.referenceNumber
  );

  /*
  |--------------------------------------------------------------------------
  | NOTIFY SUPPORT ADMINISTRATORS
  |--------------------------------------------------------------------------
  |
  | Notification failures must never prevent the user from receiving their
  | successfully created support case.
  |
  */

  try {
    console.log(
      "Attempting support administrator email notification:",
      supportCase.referenceNumber
    );

    await notifySupportAdminsOfNewCase(
      supportCase
    );

    console.log(
      "Support administrator notification process completed:",
      supportCase.referenceNumber
    );
  } catch (
    notificationError
  ) {
    console.error(
      "Support administrator notification encountered an unexpected error:",
      notificationError
    );
  }

  return {
    supportCase,

    duplicate: false,
  };
}

export async function getSupportCaseByReference({
  referenceNumber,
  userId,
  contactEmail,
}: {
  referenceNumber: string;
  userId?: string | null;
  contactEmail?: string | null;
}): Promise<SupportCase | null> {
  const normalizedReference =
    referenceNumber
      .trim()
      .toUpperCase();

  const normalizedEmail =
    normalizeEmail(
      contactEmail
    );

  if (
    !normalizedReference ||
    (
      !userId &&
      !normalizedEmail
    )
  ) {
    return null;
  }

  if (userId) {
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
          "reference_number",
          normalizedReference
        )
        .eq(
          "user_id",
          userId
        )
        .maybeSingle();

    if (error) {
      console.error(
        "Support case lookup error:",
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

  if (normalizedEmail) {
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
          "reference_number",
          normalizedReference
        )
        .eq(
          "contact_email",
          normalizedEmail
        )
        .maybeSingle();

    if (error) {
      console.error(
        "Support case lookup error:",
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

  return null;
}