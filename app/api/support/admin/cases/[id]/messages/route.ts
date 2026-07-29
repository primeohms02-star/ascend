import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireSupportAdmin,
} from "@/lib/support/admin-auth";

import {
  getAdminSupportCase,
} from "@/lib/support/admin";

import {
  createSupportCaseMessage,
  listSupportCaseMessages,
} from "@/lib/support/messages";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function normalizeId(
  value: string
): string {
  return value
    .trim()
    .slice(0, 100);
}

function normalizeMessage(
  value: unknown
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .replace(
      /\u0000/g,
      ""
    )
    .trim()
    .slice(0, 5000);
}

function normalizeName(
  value: unknown
): string {
  if (
    typeof value !== "string"
  ) {
    return "ASCEND Support";
  }

  return (
    value
      .replace(
        /\u0000/g,
        ""
      )
      .trim()
      .slice(0, 200) ||
    "ASCEND Support"
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
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await requireSupportAdmin();

    const {
      id,
    } = await context.params;

    const caseId =
      normalizeId(id);

    if (!caseId) {
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

    const supportCase =
      await getAdminSupportCase(
        caseId
      );

    if (!supportCase) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The requested support case was not found.",
        },
        {
          status: 404,
        }
      );
    }

    const messages =
      await listSupportCaseMessages(
        supportCase.id
      );

    return NextResponse.json({
      success: true,
      messages,
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
      "Support Admin message GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "ASCEND could not load the support conversation.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const {
      userId,
    } =
      await requireSupportAdmin();

    const {
      id,
    } = await context.params;

    const caseId =
      normalizeId(id);

    const body =
      (await request.json()) as {
        message?: unknown;
        senderName?: unknown;
      };

    const message =
      normalizeMessage(
        body.message
      );

    const senderName =
      normalizeName(
        body.senderName
      );

    if (!caseId) {
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

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Enter a support reply before sending.",
        },
        {
          status: 400,
        }
      );
    }

    const supportCase =
      await getAdminSupportCase(
        caseId
      );

    if (!supportCase) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The requested support case was not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      supportCase.status ===
      "closed"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Reopen this case before sending another support reply.",
        },
        {
          status: 409,
        }
      );
    }

    const supportMessage =
      await createSupportCaseMessage({
        caseId:
          supportCase.id,

        senderType:
          "support",

        senderUserId:
          userId,

        senderName,

        message,
      });

    return NextResponse.json(
      {
        success: true,
        supportMessage,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    const authorizationError =
      getAuthorizationError(
        error
      );

    if (authorizationError) {
      return authorizationError;
    }

    console.error(
      "Support Admin message POST error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "ASCEND could not send the support reply.",
      },
      {
        status: 500,
      }
    );
  }
}