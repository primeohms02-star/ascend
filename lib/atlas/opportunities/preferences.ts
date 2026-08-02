import { supabaseServer } from "@/lib/supabase-server";

export async function updatePreference(
  clerkId: string,
  category: string,
  delta: number
) {
  const { data } = await supabaseServer
    .from("atlas_preferences")
    .select("*")
    .eq("clerk_id", clerkId)
    .eq("category", category)
    .single();

  if (!data) {
    await supabaseServer
      .from("atlas_preferences")
      .insert({
        clerk_id: clerkId,
        category,
        score: delta,
      });

    return;
  }

  await supabaseServer
    .from("atlas_preferences")
    .update({
      score: data.score + delta,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.id);
}