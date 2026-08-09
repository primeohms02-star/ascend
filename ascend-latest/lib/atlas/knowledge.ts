import {
  supabaseServer,
} from "@/lib/supabase-server";

function normalizeConfidence(
  confidence: number
) {
  if (
    !Number.isFinite(confidence)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(1, confidence)
  );
}

export async function saveKnowledge(
  userId: string,
  category: string,
  fact: string,
  confidence: number
) {
  const cleanCategory =
    category.trim();

  const cleanFact =
    fact.trim();

  if (
    !cleanCategory ||
    !cleanFact
  ) {
    throw new Error(
      "Knowledge requires a category and fact."
    );
  }

  const { data, error } =
    await supabaseServer
      .from("atlas_knowledge")
      .insert({
        user_id: userId,
        category:
          cleanCategory,
        fact:
          cleanFact,
        confidence:
          normalizeConfidence(
            confidence
          ),
      })
      .select()
      .single();

  if (error) {
    console.error(
      "Atlas Knowledge Save Error:",
      error
    );

    throw error;
  }

  return data;
}

export async function loadKnowledge(
  userId: string,
  limit = 50
) {
  const { data, error } =
    await supabaseServer
      .from("atlas_knowledge")
      .select("*")
      .eq("user_id", userId)
      .order("confidence", {
        ascending: false,
      })
      .limit(Math.max(1, Math.min(50, Math.floor(limit))));

  if (error) {
    console.error(
      "Atlas Knowledge Load Error:",
      error
    );

    throw error;
  }

  return data ?? [];
}

export async function updateKnowledge(
  id: string,
  fact: string,
  confidence: number
) {
  const cleanFact =
    fact.trim();

  if (!cleanFact) {
    throw new Error(
      "Knowledge fact is required."
    );
  }

  const { data, error } =
    await supabaseServer
      .from("atlas_knowledge")
      .update({
        fact:
          cleanFact,
        confidence:
          normalizeConfidence(
            confidence
          ),
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .maybeSingle();

  if (error) {
    console.error(
      "Atlas Knowledge Update Error:",
      error
    );

    throw error;
  }

  return data ?? null;
}