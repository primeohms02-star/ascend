import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import { loadConversation } from "@/lib/atlas/memory";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const storedConversation =
      await loadConversation(userId);

    const conversation = storedConversation
      .filter(
        (item) =>
          typeof item.message === "string" &&
          item.message.trim().length > 0
      )
      .map((item) => ({
        role:
          item.role === "user"
            ? ("user" as const)
            : ("atlas" as const),
        message: item.message,
        createdAt: item.created_at,
      }));

    return NextResponse.json(
      { conversation },
      {
        headers: {
          "Cache-Control":
            "private, no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Atlas History Error:", error);

    return NextResponse.json(
      {
        error:
          "Atlas could not load your conversation history.",
      },
      { status: 500 }
    );
  }
}
