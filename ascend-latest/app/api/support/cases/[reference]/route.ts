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
  value: string | null
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

  if (!emailPattern.test(email)) {
    return null;
  }

  return email;
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
      normalizeReference(reference);

    const contactEmail =
      normalizeEmail(
        request.nextUrl.searchParams.get(
          "email"
        )
      );

    if (!referenceNumber) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A support case reference number is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!userId && !contactEmail) {
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
      await getSupportCaseByReference({
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

    return NextResponse.json({
      success: true,
      supportCase,
    });
  } catch (error) {
    console.error(
      "Support case route error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "ASCEND could not retrieve this support case.",
      },
      {
        status: 500,
      }
    );
  }
}