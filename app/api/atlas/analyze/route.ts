import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@clerk/nextjs/server";

import {
  rewriteOpportunity,
} from "@/lib/atlas/opportunities/atlas-ai";

const MAX_DESCRIPTION_LENGTH = 30_000;

export async function POST(
  request: NextRequest
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const description =
      body.description;

    if (
      typeof description !== "string" ||
      description.trim().length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "A valid opportunity description is required.",
        },
        {
          status: 400,
        }
      );
    }

    const cleanDescription =
      description.trim();

    if (
      cleanDescription.length >
      MAX_DESCRIPTION_LENGTH
    ) {
      return NextResponse.json(
        {
          error:
            "The opportunity description is too long.",
        },
        {
          status: 413,
        }
      );
    }

    const analysis =
      await rewriteOpportunity(
        cleanDescription
      );

    return NextResponse.json({
      analysis,
    });
  } catch (error) {
    console.error(
      "Atlas Analysis Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Atlas couldn't analyze this opportunity.",
      },
      {
        status: 500,
      }
    );
  }
}