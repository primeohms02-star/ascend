import {
  supabaseServer,
} from "@/lib/supabase-server";

export async function getMomentum(
  userId: string
) {
  const { data, error } =
    await supabaseServer
      .from("atlas_momentum")
      .select("*")
      .eq(
        "user_id",
        userId
      )
      .maybeSingle();

  if (error) {
    console.error(
      "Momentum Load Error:",
      error
    );

    throw error;
  }

  return data ?? null;
}