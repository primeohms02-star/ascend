import { supabase } from "./client";

export async function getIdentity(userId: string) {
  const { data, error } = await supabase
    .from("atlas_identity")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) return null;

  return data;
}

export async function saveIdentity(
  userId: string,
  title: string,
  description: string,
  confidence = 50
) {
  const { error } = await supabase
    .from("atlas_identity")
    .upsert(
      {
        user_id: userId,
        identity_title: title,
        identity_description: description,
        confidence,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) {
    console.error("Identity save error:", error);
    throw error;
  }
}