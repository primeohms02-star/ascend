import { getKnowledge } from "@/lib/supabase/atlasKnowledge";
import { getReflections } from "@/lib/supabase/atlasReflections";
import { getIdentity } from "@/lib/supabase/atlasIdentity";
import { getCurrentUserBrain } from "@/lib/services/user";

export async function buildBrain(
  userId: string
) {
  const profile =
    await getCurrentUserBrain();

  const knowledge =
    await getKnowledge(userId);

  const reflections =
    await getReflections(userId);

  const identity =
    await getIdentity(userId);

  return {
    profile,

    identity,

    knowledge,

    reflections,
  };
}