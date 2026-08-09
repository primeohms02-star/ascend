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
import {
  analyzeAtlasImage,
  isValidAtlasImage,
} from "@/lib/atlas/vision";

function shouldExtractPermanentMemory(message: string) {
  if (
    /\b(?:password|passcode|security answer|secret key|api[- ]?key|one[- ]time (?:password|code)|otp|pin|cvv|credit card|debit card|bank account|bvn|nin|social security number)\b/i.test(
      message
    )
  ) {
    return false;
  }

  return /\b(?:my (?:long[- ]term )?(?:goal|goals|values|preference|preferences|career|ambition|ambitions)|i (?:prefer|value|work as|study|have experience in|am skilled in)|i['’]m (?:a|an)|i am (?:a|an)|i want to become|i plan to become)\b/i.test(
    message
  );
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const image = body.image;
    const hasImage = image !== undefined && image !== null;

    if (hasImage && !isValidAtlasImage(image)) {
      return NextResponse.json(
        { error: "Atlas supports JPEG, PNG and WebP image attachments that fit within the vision request limit." },
        { status: 400 }
      );
    }

    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message && !hasImage) {
      return NextResponse.json(
        { error: "A message or image is required." },
        { status: 400 }
      );
    }

    const cleanMessage = message || "Please analyze this image.";
    const pageContext =
      typeof body.context === "string" ? body.context.trim().slice(0, 2200) : "";

    const factPromise = shouldExtractPermanentMemory(cleanMessage)
      ? extractPermanentMemory(cleanMessage).catch((error) => {
          console.error("Atlas Permanent Memory Extraction Error:", error);
          return "NONE";
        })
      : Promise.resolve("NONE");

    let visualContext = "";

    if (hasImage && isValidAtlasImage(image)) {
      try {
        const visualSummary = await analyzeAtlasImage({
          image,
          userMessage: cleanMessage,
        });

        visualContext = `Uploaded image analysis:\n${visualSummary}`;
      } catch (error) {
        console.error("Atlas Image Analysis Error:", error);

        return NextResponse.json(
          {
            error:
              "Atlas could not analyze that image right now. Your text conversations are still available.",
          },
          { status: 502 }
        );
      }
    }

    const surfaceContext = [pageContext, visualContext]
      .filter(Boolean)
      .join("\n\n");

    const [atlasResult, fact] = await Promise.all([
      runAtlasBrain({
        clerkId: userId,
        message: cleanMessage,
        surfaceContext: surfaceContext || undefined,
      }),
      factPromise,
    ]);

    await persistAtlasResponse({
      clerkId: userId,
      userMessage: cleanMessage,
      reply: atlasResult.reply,
      fact,
    });

    return NextResponse.json({ reply: atlasResult.reply });
  } catch (error) {
    console.error("Atlas Chat Error:", error);

    return NextResponse.json(
      {
        error: "Atlas encountered an error.",
        reply: "I encountered a problem while thinking about that. Please try again.",
      },
      { status: 500 }
    );
  }
}
