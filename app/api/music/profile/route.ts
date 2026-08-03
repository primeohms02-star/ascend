import { NextRequest, NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import {
  loadMusicProfile,
  saveMusicProfile,
} from "@/lib/music/profile";
import {
  MUSIC_CHALLENGES,
  MUSIC_GENRES,
  MUSIC_GOALS,
  MUSIC_REGIONS,
  MUSIC_ROLES,
  MUSIC_SKILLS,
  MUSIC_STAGES,
  type MusicProfileInput,
} from "@/lib/music/types";
import { invalidateOpportunitySnapshot } from "@/lib/atlas/opportunities/service";

export const dynamic = "force-dynamic";

function cleanSelection(
  value: unknown,
  allowed: readonly string[],
  maximum: number,
  required = true
): string[] | null {
  if (!Array.isArray(value) || value.length > maximum) {
    return null;
  }

  const cleaned = [
    ...new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => allowed.includes(item))
    ),
  ];

  if ((required && cleaned.length === 0) || cleaned.length !== value.length) {
    return null;
  }

  return cleaned;
}

function validateInput(value: unknown): MusicProfileInput | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const body = value as Record<string, unknown>;
  const roles = cleanSelection(body.roles, MUSIC_ROLES, 8);
  const genres = cleanSelection(body.genres, MUSIC_GENRES, 12);
  const skills = cleanSelection(body.skills, MUSIC_SKILLS, 20, false);
  const challenges = cleanSelection(body.challenges, MUSIC_CHALLENGES, 10);
  const preferredRegions = cleanSelection(
    body.preferredRegions,
    MUSIC_REGIONS,
    6
  );

  const careerStage =
    typeof body.careerStage === "string" &&
    MUSIC_STAGES.includes(
      body.careerStage as (typeof MUSIC_STAGES)[number]
    )
      ? body.careerStage
      : null;

  const goal =
    typeof body.goal === "string" &&
    MUSIC_GOALS.includes(body.goal as (typeof MUSIC_GOALS)[number])
      ? body.goal
      : null;

  const location =
    typeof body.location === "string"
      ? body.location.trim().replace(/\s+/g, " ")
      : "";

  const northStar =
    typeof body.northStar === "string"
      ? body.northStar.trim().replace(/\s+/g, " ")
      : "";

  if (
    !roles ||
    !genres ||
    !skills ||
    !challenges ||
    !preferredRegions ||
    !careerStage ||
    !goal ||
    location.length < 2 ||
    location.length > 100 ||
    northStar.length < 20 ||
    northStar.length > 1200
  ) {
    return null;
  }

  return {
    roles,
    careerStage,
    genres,
    skills,
    goal,
    challenges,
    location,
    preferredRegions,
    northStar,
  };
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { profile: await loadMusicProfile(userId) },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Music Profile API Load Error:", error);
    return NextResponse.json(
      { error: "ASCEND Music could not load your pathway." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const input = validateInput(await request.json());

    if (!input) {
      return NextResponse.json(
        { error: "Some Music Pathway answers are missing or invalid." },
        { status: 400 }
      );
    }

    const profile = await saveMusicProfile(userId, input);
    invalidateOpportunitySnapshot(userId);

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Music Profile API Save Error:", error);
    return NextResponse.json(
      { error: "ASCEND Music could not save your pathway." },
      { status: 500 }
    );
  }
}
