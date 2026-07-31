import {
  supabaseServer,
} from "@/lib/supabase-server";

export async function getMissions(
  userId: string
) {
  const { data, error } =
    await supabaseServer
      .from("atlas_missions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    console.error(
      "Get Missions Error:",
      error
    );

    throw error;
  }

  return data ?? [];
}