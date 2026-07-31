import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@clerk/nextjs/server";

import {
  runAtlasBrain,
} from "@/lib/atlas/brain";

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

    /*
     * Consume the request safely for compatibility
     * with older callers, but never trust or use a
     * browser-supplied Clerk ID.
     */
    try {
      await request.json();
    } catch {
      /*
       * This endpoint does not require a request body.
       */
    }

    const atlasResult =
      await runAtlasBrain({
        clerkId: userId,
        message: `
Give me one concise strategic insight about my current direction.

Rules:
- Use my live ASCEND context.
- Do not greet me.
- Do not invent progress or achievements.
- Do not repeat an old mission as current.
- Do not modify or generate a mission.
- Do not claim certainty without evidence.
- Keep the insight under 120 words.
        `.trim(),
      });

    return NextResponse.json({
      insight: atlasResult.reply,
    });
  } catch (error) {
    console.error(
      "Atlas Insight Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Atlas could not generate an insight.",
        insight:
          "No strategic insight is available right now.",
      },
      {
        status: 500,
      }
    );
  }
}