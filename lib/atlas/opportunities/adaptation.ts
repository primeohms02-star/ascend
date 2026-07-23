import { Opportunity } from "./types";
import { supabaseServer } from "@/lib/supabase-server";

export async function adaptRecommendations(
  clerkId: string,
  opportunities: Opportunity[]
): Promise<Opportunity[]> {

  const { data: preferences } = await supabaseServer
    .from("atlas_preferences")
    .select("*")
    .eq("clerk_id", clerkId);

  if (!preferences || preferences.length === 0) {
    return opportunities;
  }

  return opportunities.sort((a, b) => {

    const scoreA =
      preferences.reduce((sum, pref) => {

        if (
          a.category === pref.category ||
          a.tags?.includes(pref.category)
        ) {
          return sum + pref.score;
        }

        return sum;

      }, 0);

    const scoreB =
      preferences.reduce((sum, pref) => {

        if (
          b.category === pref.category ||
          b.tags?.includes(pref.category)
        ) {
          return sum + pref.score;
        }

        return sum;

      }, 0);

    return scoreB - scoreA;

  });

}