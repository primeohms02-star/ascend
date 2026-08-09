import {
  supabaseServer,
} from "@/lib/supabase-server";

export async function loadAtlasMemories(
  clerkId: string
) {
  const { data, error } =
    await supabaseServer
      .from("atlas_memory")
      .select(
        "id,memory_type,title,message,metadata,created_at"
      )
      .eq("user_id", clerkId)
      .neq(
        "memory_type",
        "conversation"
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(20);

  if (error) {
    console.error(
      "Load Atlas Memories Error:",
      error
    );

    throw error;
  }

  return data ?? [];
}

export async function loadConversation(
  clerkId: string,
  limit = 50
) {
  /*
   * Load the newest messages first so the database
   * limit keeps recent conversation instead of the
   * user's oldest messages.
   */
  const { data, error } =
    await supabaseServer
      .from("atlas_memory")
      .select(
        "role,message,created_at"
      )
      .eq("user_id", clerkId)
      .eq(
        "memory_type",
        "conversation"
      )
      .in("role", [
        "user",
        "assistant",
        "atlas",
      ])
      .order("created_at", {
        ascending: false,
      })
      .limit(
        Math.max(
          1,
          Math.min(50, Math.round(limit))
        )
      );

  if (error) {
    console.error(
      "Load Atlas Conversation Error:",
      error
    );

    throw error;
  }

  /*
   * Groq must receive messages in chronological order.
   */
  return [...(data ?? [])].reverse();
}

export async function saveUserMessage(
  clerkId: string,
  message: string
) {
  const { data, error } =
    await supabaseServer
      .from("atlas_memory")
      .insert({
        user_id: clerkId,
        role: "user",
        memory_type:
          "conversation",
        message,
      })
      .select()
      .single();

  if (error) {
    console.error(
      "Save Atlas User Message Error:",
      error
    );

    throw error;
  }

  return data;
}

export async function saveAtlasReply(
  clerkId: string,
  reply: string
) {
  const { data, error } =
    await supabaseServer
      .from("atlas_memory")
      .insert({
        user_id: clerkId,
        role: "assistant",
        memory_type:
          "conversation",
        message: reply,
      })
      .select()
      .single();

  if (error) {
    console.error(
      "Save Atlas Reply Error:",
      error
    );

    throw error;
  }

  return data;
}

export async function saveFact(
  clerkId: string,
  fact: string
) {
  const cleanFact =
    fact.trim();

  if (
    !cleanFact ||
    cleanFact.toUpperCase() ===
      "NONE"
  ) {
    return null;
  }

  /*
   * Avoid storing the exact same permanent fact
   * repeatedly.
   */
  const {
    data: existingFact,
    error: lookupError,
  } = await supabaseServer
    .from("atlas_facts")
    .select("id")
    .eq("user_id", clerkId)
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

  if (existingFact) {
    return existingFact;
  }

  const { data, error } =
    await supabaseServer
      .from("atlas_facts")
      .insert({
        user_id: clerkId,
        fact: cleanFact,
      })
      .select()
      .single();

  if (error) {
    console.error(
      "Save Atlas Fact Error:",
      error
    );

    throw error;
  }

  return data;
}
