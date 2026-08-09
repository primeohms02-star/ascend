import {
  supabaseServer,
} from "@/lib/supabase-server";

export async function loadJourney(
  clerkId: string
) {
  const { data, error } =
    await supabaseServer
      .from("profiles")
      .select(
        "clerk_id,journey,north_star"
      )
      .eq(
        "clerk_id",
        clerkId
      )
      .maybeSingle();

  if (error) {
    console.error(
      "Atlas Journey Load Error:",
      error
    );

    throw error;
  }

  return data ?? null;
}

/*
 * Legacy functions retained temporarily so obsolete
 * imports do not break the build. Journey steps are
 * represented by atlas_missions.
 */
export async function addJourneyStep() {
  return null;
}

export async function completeJourneyStep() {
  return null;
}