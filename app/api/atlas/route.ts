import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { askAtlas } from "@/lib/services/atlas";
import { askGroq } from "@/lib/groq/chat";
import { saveAtlasMemory } from "@/lib/supabase/atlasMemory";

export async function POST(req: Request) {
  const { question } = await req.json();

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Save the user's message
  await saveAtlasMemory(
    userId,
    "user",
    question
  );

  // Build Atlas prompt
  const atlas = await askAtlas(question);

  // Ask Groq
  const answer = await askGroq(atlas.prompt);

  // Save Atlas's response
  await saveAtlasMemory(
    userId,
    "atlas",
    answer
  );

  return NextResponse.json({
    answer,
    context: atlas.context,
  });
}