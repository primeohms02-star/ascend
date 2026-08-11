import { NextRequest, NextResponse } from "next/server";

import { requireSupportAdmin } from "@/lib/support/admin-auth";
import { getAdminSupportCase, updateSupportCase } from "@/lib/support/admin";
import type { SupportCaseStatus } from "@/lib/support/types";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const validStatuses: SupportCaseStatus[] = [
  "open",
  "investigating",
  "waiting_for_user",
  "resolved",
  "closed",
];

function authorizationError(error: unknown): NextResponse | null {
  if (error instanceof Error && error.message === "SUPPORT_ADMIN_UNAUTHENTICATED") {
    return NextResponse.json(
      { success: false, error: "You must sign in to access Support Admin." },
      { status: 401 }
    );
  }

  if (error instanceof Error && error.message === "SUPPORT_ADMIN_FORBIDDEN") {
    return NextResponse.json(
      { success: false, error: "You are not authorized to access Support Admin." },
      { status: 403 }
    );
  }

  return null;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requireSupportAdmin();
    const { id } = await context.params;
    const caseId = id.trim().slice(0, 100);

    if (!caseId) {
      return NextResponse.json(
        { success: false, error: "A support case ID is required." },
        { status: 400 }
      );
    }

    const supportCase = await getAdminSupportCase(caseId);

    if (!supportCase) {
      return NextResponse.json(
        { success: false, error: "The requested support case was not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, supportCase },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } }
    );
  } catch (error) {
    const authError = authorizationError(error);
    if (authError) return authError;

    console.error("Support Admin case GET error:", error);
    return NextResponse.json(
      { success: false, error: "ASCEND could not load the support case." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireSupportAdmin();
    const { id } = await context.params;
    const caseId = id.trim().slice(0, 100);
    const body = (await request.json()) as {
      status?: unknown;
      resolution?: unknown;
      assignedTo?: unknown;
    };

    const status =
      typeof body.status === "string" && validStatuses.includes(body.status as SupportCaseStatus)
        ? (body.status as SupportCaseStatus)
        : undefined;

    const resolution =
      body.resolution === undefined
        ? undefined
        : typeof body.resolution === "string"
          ? body.resolution
          : null;

    const assignedTo =
      body.assignedTo === undefined
        ? undefined
        : typeof body.assignedTo === "string"
          ? body.assignedTo
          : null;

    if (!caseId) {
      return NextResponse.json(
        { success: false, error: "A support case ID is required." },
        { status: 400 }
      );
    }

    const supportCase = await updateSupportCase(caseId, {
      status,
      resolution,
      assignedTo,
    });

    return NextResponse.json({ success: true, supportCase });
  } catch (error) {
    const authError = authorizationError(error);
    if (authError) return authError;

    console.error("Support Admin case PATCH error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "ASCEND could not update the support case.",
      },
      { status: 500 }
    );
  }
}
