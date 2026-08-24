import {
  supabaseServer,
} from "@/lib/supabase-server";
import type { Json } from "@/lib/database.types";

export async function loadCompassResults(
  clerkId: string
) {
  const { data, error } =
    await supabaseServer
      .from("compass_results")
      .select("*")
      .eq(
        "clerk_id",
        clerkId
      )
      .maybeSingle();

  if (error) {
    console.error(
      "Compass Results Load Error:",
      error
    );

    throw error;
  }

  return data ?? null;
}

export async function saveCompassResults(
  clerkId: string,
  results: {
    answers: Json;
    direction: string;
    north_star: string;
    next_step: string;
  }
) {
  const { data, error } =
    await supabaseServer
      .from("compass_results")
      .upsert(
        {
          clerk_id:
            clerkId,
          answers:
            results.answers,
          direction:
            results.direction,
          north_star:
            results.north_star,
          next_step:
            results.next_step,
        },
        {
          onConflict:
            "clerk_id",
        }
      )
      .select()
      .single();

  if (error) {
    console.error(
      "Compass Results Save Error:",
      error
    );

    throw error;
  }

  return data;
}
