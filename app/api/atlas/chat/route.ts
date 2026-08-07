import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@clerk/nextjs/server";

import {
  extractPermanentMemory,
  persistAtlasResponse,
  runAtlasBrain,
} from "@/lib/atlas/brain";

export async function POST(
  request: NextRequest
) {
  try {
    /*
     * Never trust a Clerk ID supplied by the browser.
     * The authenticated server session determines the user.
     */
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

    const message = body.message;

    if (
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "A message is required.",
        },
        {
          status: 400,
        }
      );
    }

    const cleanMessage =
      message.trim();

    /*
     * Atlas answers using live profile, mission,
     * Compass, momentum, and conversation context.
     *
     * This does not complete, replace, or create
     * any mission.
     */
    const [atlasResult, fact] =
      await Promise.all([
        runAtlasBrain({
          clerkId: userId,
          message: cleanMessage,
        }),

        /*
         * Permanent-memory extraction depends only on the
         * user's message, so it can run while Atlas thinks
         * instead of adding a second wait to every reply.
         */
        extractPermanentMemory(
          cleanMessage
        ),
      ]);

    /*
     * Save only the conversation and any genuinely
     * permanent fact. This does not change mission
     * or progression state.
     */
    await persistAtlasResponse({
      clerkId: userId,
      profile: atlasResult.profile,
      userMessage: cleanMessage,
      reply: atlasResult.reply,
      fact,
    });

    return NextResponse.json({
      reply: atlasResult.reply,
    });
  } catch (error) {
    console.error(
      "Atlas Chat Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Atlas encountered an error.",
        reply:
          "I encountered a problem while thinking about that. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}