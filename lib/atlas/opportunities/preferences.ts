import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function updatePreference(
  clerkId: string,
  category: string,
  delta: number
) {
  const { data } = await supabase
    .from("atlas_preferences")
    .select("*")
    .eq("clerk_id", clerkId)
    .eq("category", category)
    .single();

  if (!data) {
    await supabase.from("atlas_preferences").insert({
      clerk_id: clerkId,
      category,
      score: delta,
    });

    return;
  }

  await supabase
    .from("atlas_preferences")
    .update({
      score: data.score + delta,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.id);
}