import "server-only";

import { supabaseServer } from "@/lib/supabase-server";

import type {
  MusicProfile,
  MusicProfileInput,
} from "./types";

type MusicProfileRow = {
  id: string;
  user_id: string;
  roles: string[];
  career_stage: string;
  genres: string[];
  skills: string[];
  goal: string;
  challenges: string[];
  location: string;
  preferred_regions: string[];
  north_star: string;
  created_at: string;
  updated_at: string;
};

function mapMusicProfile(row: MusicProfileRow): MusicProfile {
  return {
    id: row.id,
    userId: row.user_id,
    roles: row.roles ?? [],
    careerStage: row.career_stage,
    genres: row.genres ?? [],
    skills: row.skills ?? [],
    goal: row.goal,
    challenges: row.challenges ?? [],
    location: row.location,
    preferredRegions: row.preferred_regions ?? [],
    northStar: row.north_star,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function loadMusicProfile(
  userId: string
): Promise<MusicProfile | null> {
  const { data, error } = await supabaseServer
    .from("ascend_music_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Music Profile Load Error:", error);
    throw error;
  }

  return data
    ? mapMusicProfile(data as MusicProfileRow)
    : null;
}

export async function saveMusicProfile(
  userId: string,
  input: MusicProfileInput
): Promise<MusicProfile> {
  const { data, error } = await supabaseServer
    .from("ascend_music_profiles")
    .upsert(
      {
        user_id: userId,
        roles: input.roles,
        career_stage: input.careerStage,
        genres: input.genres,
        skills: input.skills,
        goal: input.goal,
        challenges: input.challenges,
        location: input.location,
        preferred_regions: input.preferredRegions,
        north_star: input.northStar,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .single();

  if (error) {
    console.error("Music Profile Save Error:", error);
    throw error;
  }

  return mapMusicProfile(data as MusicProfileRow);
}
