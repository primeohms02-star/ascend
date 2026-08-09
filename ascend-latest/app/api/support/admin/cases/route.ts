import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireSupportAdmin,
} from "@/lib/support/admin-auth";

import {
  listSupportCases,
  updateSupportCase,
} from "@/lib/support/admin";

import type {
  SupportCaseStatus,
  SupportCategory,
  SupportUrgency,
} from "@/lib/support/types";

const validStatuses: SupportCaseStatus[] =
  [
    "open",
    "investigating",
    "waiting_for_user",
    "resolved",
    "closed",
  ];

const validCategories: SupportCategory[] =
  [
    "account",
    "authentication",
    "onboarding",
    "dashboard",
    "atlas",
    "missions",
    "opportunities",
    "progress",
    "technical",
    "billing",
    "feedback",
    "other",
  ];

const validUrgencies: SupportUrgency[] =
  [
    "low",
    "normal",
    "high",
    "critical",
  ];

function isSupportCaseStatus(
  value: unknown
): value is SupportCaseStatus {
  return (
    typeof value ===
      "string" &&
    validStatuses.includes(
      value as SupportCaseStatus
    )
  );
}

function isSupportCategory(
  value: unknown
): value is SupportCategory {
  return (
    typeof value ===
      "string" &&
    validCategories.includes(
      value as SupportCategory
    )
  );
}

function isSupportUrgency(
  value: unknown
): value is SupportUrgency {
  return (
    typeof value ===
      "string" &&
    validUrgencies.includes(
      value as SupportUrgency
    )
  );
}

function getAuthorizationError(
  error: unknown
): NextResponse | null {
  if (
    error instanceof Error &&
    error.message ===
      "SUPPORT_ADMIN_UNAUTHENTICATED"
  ) {
    return NextResponse.json(
      {
        success: false,
        error:
          "You must sign in to access Support Admin.",
      },
      {
        status: 401,
      }
    );
  }

  if (
    error instanceof Error &&
    error.message ===
      "SUPPORT_ADMIN_FORBIDDEN"
  ) {
    return NextResponse.json(
      {
        success: false,
        error:
          "You are not authorized to access Support Admin.",
      },
      {
        status: 403,
      }
    );
  }

  return null;
}

export async function GET(
  request: NextRequest
) {
  try {
    await requireSupportAdmin();

    const {
      searchParams,
    } = request.nextUrl;

    const rawStatus =
      searchParams.get(
        "status"
      );

    const rawCategory =
      searchParams.get(
        "category"
      );

    const rawUrgency =
      searchParams.get(
        "urgency"
      );

    const search =
      searchParams
        .get("search")
        ?.trim()
        .slice(0, 100) ??
      "";

    const requestedLimit =
      Number(
        searchParams.get(
          "limit"
        ) ?? 100
      );

    const limit =
      Number.isFinite(
        requestedLimit
      )
        ? Math.max(
            1,
            Math.min(
              Math.floor(
                requestedLimit
              ),
              200
            )
          )
        : 100;

    const status =
      rawStatus === "all" ||
      rawStatus === null
        ? "all"
        : isSupportCaseStatus(
            rawStatus
          )
        ? rawStatus
        : "all";

    const category =
      rawCategory === "all" ||
      rawCategory === null
        ? "all"
        : isSupportCategory(
            rawCategory
          )
        ? rawCategory
        : "all";

    const urgency =
      rawUrgency === "all" ||
      rawUrgency === null
        ? "all"
        : isSupportUrgency(
            rawUrgency
          )
        ? rawUrgency
        : "all";

    const cases =
      await listSupportCases({
        status,
        category,
        urgency,
        search,
        limit,
      });

    return NextResponse.json({
      success: true,
      cases,
      count: cases.length,
    });
  } catch (error) {
    const authorizationError =
      getAuthorizationError(
        error
      );

    if (authorizationError) {
      return authorizationError;
    }

    console.error(
      "Support Admin GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "ASCEND could not load support cases.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    await requireSupportAdmin();

    const body =
      (await request.json()) as {
        id?: unknown;
        status?: unknown;
        resolution?: unknown;
        assignedTo?: unknown;
      };

    const id =
      typeof body.id ===
      "string"
        ? body.id
            .trim()
            .slice(0, 100)
        : "";

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A support case ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      body.status !==
        undefined &&
      !isSupportCaseStatus(
        body.status
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The selected support case status is invalid.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      body.resolution !==
        undefined &&
      body.resolution !==
        null &&
      typeof body.resolution !==
        "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The case resolution must be text.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      body.assignedTo !==
        undefined &&
      body.assignedTo !==
        null &&
      typeof body.assignedTo !==
        "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The assigned support agent must be text.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      body.status ===
        undefined &&
      body.resolution ===
        undefined &&
      body.assignedTo ===
        undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No support case changes were provided.",
        },
        {
          status: 400,
        }
      );
    }

    const supportCase =
      await updateSupportCase(
        id,
        {
          status:
            isSupportCaseStatus(
              body.status
            )
              ? body.status
              : undefined,

          resolution:
            typeof body.resolution ===
            "string"
              ? body.resolution
                  .trim()
                  .slice(
                    0,
                    5000
                  )
              : body.resolution ===
                null
              ? null
              : undefined,

          assignedTo:
            typeof body.assignedTo ===
            "string"
              ? body.assignedTo
                  .trim()
                  .slice(
                    0,
                    200
                  )
              : body.assignedTo ===
                null
              ? null
              : undefined,
        }
      );

    return NextResponse.json({
      success: true,
      supportCase,
    });
  } catch (error) {
    const authorizationError =
      getAuthorizationError(
        error
      );

    if (authorizationError) {
      return authorizationError;
    }

    console.error(
      "Support Admin PATCH error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "ASCEND could not update the support case.",
      },
      {
        status: 500,
      }
    );
  }
}