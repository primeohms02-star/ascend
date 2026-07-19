import { supabaseServer } from "@/lib/supabase-server";
export async function loadAtlasMemories(
  clerkId: string
) {
  const { data } = await supabaseServer
    .from("atlas_memory")
    .select(
      "memory_type,title,message,metadata,created_at"
    )
    .eq("user_id", clerkId)
    .neq("memory_type", "conversation")
    .order("created_at", {
      ascending: false,
    })
    .limit(20);

  return data ?? [];
}
export async function loadConversation(clerkId: string) {
  const { data } = await supabaseServer
    .from("atlas_memory")
    .select("role,message")
    .eq("user_id", clerkId)
    .order("created_at", { ascending: true })
    .limit(50);

  return data ?? [];
}

export async function saveUserMessage(
  clerkId: string,
  message: string,
  profile: any
) {
  return await supabaseServer
    .from("atlas_memory")
    .insert({
      user_id: clerkId,
      role: "user",
      message,
      current_streak: profile.current_streak,
      longest_streak: profile.longest_streak,
      last_mission_date: new Date().toISOString(),
    });
}

export async function saveAtlasReply(
  clerkId: string,
  reply: string,
  profile: any
) {
  return await supabaseServer
    .from("atlas_memory")
    .insert({
      user_id: clerkId,
      role: "assistant",
      message: reply,
      current_streak: profile.current_streak,
      longest_streak: profile.longest_streak,
      last_mission_date: new Date().toISOString(),
    });
}

export async function saveFact(
  clerkId: string,
  fact: string
) {
  if (!fact || fact === "NONE") return;

  return await supabaseServer
    .from("atlas_facts")
    .insert({
      user_id: clerkId,
      fact,
    });
}