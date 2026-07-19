import { supabaseServer } from "@/lib/supabase-server";

export async function recordMemory(
  userId: string,
  memoryType: string,
  title: string,
  message: string,
  metadata: Record<string, any> = {}
) {
  return await supabaseServer
    .from("atlas_memory")
    .insert({
      user_id: userId,

      role: "system",

      memory_type: memoryType,

      title,

      message,

      metadata,

      current_streak:
        metadata.current_streak ?? null,

      longest_streak:
        metadata.longest_streak ?? null,

      last_mission_date:
        metadata.last_mission_date ?? null,
    });
}