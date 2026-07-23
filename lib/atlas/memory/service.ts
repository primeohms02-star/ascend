import { AtlasMemory, EmptyMemory } from "./memory";

export async function getAtlasMemory(
  userId: string
): Promise<AtlasMemory> {

  // Temporary implementation.
  // Next step will load from Supabase.

  console.log(`Loading Atlas Memory for ${userId}`);

  return EmptyMemory;
}

export async function saveAtlasMemory(
  userId: string,
  memory: AtlasMemory
): Promise<void> {

  console.log(`Saving Atlas Memory for ${userId}`);

  // Supabase implementation comes next.
}