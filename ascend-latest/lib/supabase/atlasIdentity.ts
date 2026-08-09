import {
  supabaseServer,
} from "@/lib/supabase-server";

export async function getIdentity(
  userId: string
) {
  const { data, error } =
    await supabaseServer
      .from("atlas_identity")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

  if (error) {
    console.error(
      "Atlas Identity Load Error:",
      error
    );

    throw error;
  }

  if (!data) {
    return {
      identity_title:
        "Explorer",

      identity_description:
        "A person discovering their path and building momentum.",

      confidence: 0,
    };
  }

  return data;
}

export async function saveIdentity(
  userId: string,
  title: string,
  description: string,
  confidence = 50
) {
  const cleanTitle =
    title.trim();

  const cleanDescription =
    description.trim();

  if (
    !cleanTitle ||
    !cleanDescription
  ) {
    throw new Error(
      "Identity requires a title and description."
    );
  }

  const safeConfidence =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(
          Number.isFinite(
            confidence
          )
            ? confidence
            : 50
        )
      )
    );

  const { data, error } =
    await supabaseServer
      .from("atlas_identity")
      .upsert(
        {
          user_id: userId,

          identity_title:
            cleanTitle,

          identity_description:
            cleanDescription,

          confidence:
            safeConfidence,

          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "user_id",
        }
      )
      .select()
      .single();

  if (error) {
    console.error(
      "Atlas Identity Save Error:",
      error
    );

    throw error;
  }

  return data;
}