import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  auth,
} from "@clerk/nextjs/server";

import {
  getSupportCaseByReference,
} from "@/lib/support/cases";

import {
  createSupportCaseMessage,
  listSupportCaseMessages,
} from "@/lib/support/messages";

type RouteContext = {
  params: Promise<{
    reference: string;
  }>;
};

function normalizeReference(
  value: string
): string {
  return value
    .trim()
    .toUpperCase()
    .slice(0, 40);
}

function normalizeEmail(
  value?: string | null
): string | null {
  const email =
    value
      ?.trim()
      .toLowerCase()
      .slice(0, 320);

  if (!email) {
    return null;
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !emailPattern.test(email)
  ) {
    return null;
  }

  return email;
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

async function findAccessibleCase({
  referenceNumber,
  userId,
  contactEmail,
}: {
  referenceNumber: string;
  userId?: string | null;
  contactEmail?: string | null;
}) {
  if (
    !userId &&
    !contactEmail
  ) {
    return null;
  }

  return getSupportCaseByReference({
    referenceNumber,
    userId,
    contactEmail,
  });
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const {
      userId,
    } = await auth();

    const {
      reference,
    } = await context.params;

    const referenceNumber =
      normalizeReference(
        reference
      );

    const contactEmail =
      normalizeEmail(
        request.nextUrl
          .searchParams
          .get("email")
      );

    if (!referenceNumber) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A support case reference is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !userId &&
      !contactEmail
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Enter the email address used when this case was created.",
        },
        {
          status: 401,
        }
      );
    }

    const supportCase =
      await findAccessibleCase({
        referenceNumber,
        userId,
        contactEmail,
      });

    if (!supportCase) {
      return NextResponse.json(
        {
          success: false,
          error:
            "We could not find a support case matching those details.",
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
    console.error(
      "Support message GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "ASCEND could not load the case conversation.",
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
    } = await auth();

    const {
      reference,
    } = await context.params;

    const referenceNumber =
      normalizeReference(
        reference
      );

    const body =
      (await request.json()) as {
        message?: unknown;
        contactEmail?: unknown;
      };

    const message =
      normalizeMessage(
        body.message
      );

    const contactEmail =
      normalizeEmail(
        typeof body.contactEmail ===
          "string"
          ? body.contactEmail
          : null
      );

    if (!referenceNumber) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A support case reference is required.",
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
            "Enter a message before sending your reply.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !userId &&
      !contactEmail
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Enter the email address used when this case was created.",
        },
        {
          status: 401,
        }
      );
    }

    const supportCase =
      await findAccessibleCase({
        referenceNumber,
        userId,
        contactEmail,
      });

    if (!supportCase) {
      return NextResponse.json(
        {
          success: false,
          error:
            "We could not find a support case matching those details.",
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
            "This support case is closed and can no longer receive replies.",
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

        senderType: "user",

        senderUserId:
          userId ?? null,

        senderName:
          userId
            ? "ASCEND User"
            : contactEmail,

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
    console.error(
      "Support message POST error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "ASCEND could not send your reply.",
      },
      {
        status: 500,
      }
    );
  }
}