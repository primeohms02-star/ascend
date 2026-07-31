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

/*
 * Legacy compatibility endpoint.
 *
 * The current Atlas interface uses /api/atlas/chat.
 * This route remains temporarily available for older
 * components, but now uses the same authenticated brain.
 */
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

    /*
     * Older clients used "question".
     * Current clients use "message".
     */
    const submittedMessage =
      typeof body.message === "string"
        ? body.message
        : body.question;

    if (
      typeof submittedMessage !== "string" ||
      submittedMessage.trim().length === 0
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
      submittedMessage.trim();

    const atlasResult =
      await runAtlasBrain({
        clerkId: userId,
        message: cleanMessage,
      });

    const fact =
      await extractPermanentMemory(
        cleanMessage
      );

    await persistAtlasResponse({
      clerkId: userId,
      profile: atlasResult.profile,
      userMessage: cleanMessage,
      reply: atlasResult.reply,
      fact,
    });

    /*
     * "reply" is the current response field.
     * "answer" temporarily supports the legacy
     * AtlasChat component.
     */
    return NextResponse.json({
      reply: atlasResult.reply,
      answer: atlasResult.reply,
      deprecated: true,
    });
  } catch (error) {
    console.error(
      "Legacy Atlas Route Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Atlas encountered an error.",
        reply:
          "Atlas encountered an error. Please try again.",
        answer:
          "Atlas encountered an error. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}