import {
  supabaseServer,
} from "@/lib/supabase-server";

export async function saveFact(
  userId: string,
  fact: string
) {
  const cleanFact =
    fact.trim();

  if (!cleanFact) {
    return null;
  }

  const {
    data: existing,
    error: lookupError,
  } = await supabaseServer
    .from("atlas_facts")
    .select("id")
    .eq("user_id", userId)
    .eq("fact", cleanFact)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    console.error(
      "Atlas Fact Lookup Error:",
      lookupError
    );

    throw lookupError;
  }

  if (existing) {
    return existing;
  }

  const { data, error } =
    await supabaseServer
      .from("atlas_facts")
      .insert({
        user_id: userId,
        fact: cleanFact,
      })
      .select()
      .single();

  if (error) {
    console.error(
      "Atlas Fact Save Error:",
      error
    );

    throw error;
  }

  return data;
}

export async function loadFacts(
  userId: string
) {
  const { data, error } =
    await supabaseServer
      .from("atlas_facts")
      .select(
        "id,fact,created_at"
      )
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      })
      .limit(50);

  if (error) {
    console.error(
      "Atlas Facts Load Error:",
      error
    );

    throw error;
  }

  return data ?? [];
}