import {
  supabaseServer,
} from "@/lib/supabase-server";

export async function getMemory(
  userId: string
) {
  const { data, error } =
    await supabaseServer
      .from("memory")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

  if (error) {
    console.error(
      "Legacy Memory Load Error:",
      error
    );

    throw error;
  }

  return data ?? null;
}