import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";



import { saveReflection } from "@/lib/supabase/reflections";
import { recordMemory } from "@/lib/atlas/recordMemory";

export async function POST(
  request: NextRequest
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const {
    missionId,
    reflection,
    mood,
  } = await request.json();

  if (!reflection || reflection.trim() === "") {
    return NextResponse.json(
      { error: "Reflection is required." },
      { status: 400 }
    );
  }

  try {
    const saved = await saveReflection(
      userId,
      missionId,
      reflection,
      mood
    );

    await recordMemory(
  userId,
  "reflection",
  "Reflection Saved",
  reflection,
  {
    missionId,
    mood,
    confidence:
      mood ?? null,

    created_at:
      new Date().toISOString(),
  }
);

    return NextResponse.json(saved);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to save reflection." },
      { status: 500 }
    );
  }
}