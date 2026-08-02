import {
  supabaseServer,
} from "@/lib/supabase-server";

export type AtlasOnboardingContext = {
  user_id: string;

  identity: string;

  goal: string;

  skills: string[];

  challenges: string[];

  north_star: string;

  direction_fact_id?:
    string | null;

  created_at?: string;

  updated_at?: string;
};

export async function loadOnboardingContext(
  userId: string
): Promise<
  AtlasOnboardingContext | null
> {
  const {
    data,
    error,
  } = await (
    supabaseServer as any
  )
    .from(
      "atlas_onboarding_context"
    )
    .select("*")
    .eq(
      "user_id",
      userId
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Onboarding Context Load Error:",
      error
    );

    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    ...data,

    skills:
      Array.isArray(
        data.skills
      )
        ? data.skills
        : [],

    challenges:
      Array.isArray(
        data.challenges
      )
        ? data.challenges
        : [],
  } as AtlasOnboardingContext;
}

export async function saveOnboardingContext(
  userId: string,
  context: {
    identity: string;

    goal: string;

    skills: string[];

    challenges: string[];

    northStar: string;
  }
): Promise<AtlasOnboardingContext> {
  const {
    data,
    error,
  } = await (
    supabaseServer as any
  )
    .from(
      "atlas_onboarding_context"
    )
    .upsert(
      {
        user_id:
          userId,

        identity:
          context.identity,

        goal:
          context.goal,

        skills:
          context.skills,

        challenges:
          context.challenges,

        north_star:
          context.northStar,

        updated_at:
          new Date()
            .toISOString(),
      },
      {
        onConflict:
          "user_id",
      }
    )
    .select()
    .single();

  if (error) {
    console.error(
      "Onboarding Context Save Error:",
      error
    );

    throw error;
  }

  return {
    ...data,

    skills:
      Array.isArray(
        data.skills
      )
        ? data.skills
        : [],

    challenges:
      Array.isArray(
        data.challenges
      )
        ? data.challenges
        : [],
  } as AtlasOnboardingContext;
}