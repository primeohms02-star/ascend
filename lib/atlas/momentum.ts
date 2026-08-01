import {
  getMomentum,
} from "@/lib/supabase/atlasMomentum";

export async function loadMomentum(
  userId: string
) {
  return await getMomentum(
    userId
  );
}