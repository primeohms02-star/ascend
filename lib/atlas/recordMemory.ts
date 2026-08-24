import {
  supabaseServer,
} from "@/lib/supabase-server";
import type { Json } from "@/lib/database.types";

export async function recordMemory(
  userId: string,
  memoryType: string,
  title: string,
  message: string,
  metadata: Record<
    string,
    Json | undefined
  > = {}
) {
  const cleanType =
    memoryType.trim();

  const cleanTitle =
    title.trim();

  const cleanMessage =
    message.trim();

  if (
    !cleanType ||
    !cleanTitle ||
    !cleanMessage
  ) {
    throw new Error(
      "Atlas memory requires a type, title and message."
    );
  }

  /*
   * A mission can produce only one completion
   * milestone. This protects the timeline from
   * duplicate retry records.
   */
  if (
    cleanType === "mission" &&
    typeof metadata.mission_id ===
      "string"
  ) {
    const {
      data: existing,
      error: lookupError,
    } = await supabaseServer
      .from("atlas_memory")
      .select("id")
      .eq("user_id", userId)
      .eq(
        "memory_type",
        "mission"
      )
      .contains("metadata", {
        mission_id:
          metadata.mission_id,
      })
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      console.error(
        "Atlas Memory Lookup Error:",
        lookupError
      );

      throw lookupError;
    }

    if (existing) {
      return existing;
    }
  }

  const { data, error } =
    await supabaseServer
      .from("atlas_memory")
      .insert({
        user_id: userId,

        role: "system",

        memory_type:
          cleanType,

        title:
          cleanTitle,

        message:
          cleanMessage,

        metadata,

        current_streak:
          typeof metadata.current_streak === "number" ? metadata.current_streak :
          null,

        longest_streak:
          typeof metadata.longest_streak === "number" ? metadata.longest_streak :
          null,

        last_mission_date:
          typeof metadata.completed_at === "string"
            ? metadata.completed_at
            : typeof metadata.last_mission_date === "string"
              ? metadata.last_mission_date
              : null,
      })
      .select()
      .single();

  if (error) {
    console.error(
      "Atlas Memory Record Error:",
      error
    );

    throw error;
  }

  return data;
}
