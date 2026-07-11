import { buildAtlasContext } from "@/lib/atlas/context";
import { buildAtlasPrompt } from "@/lib/atlas/atlas";

export async function askAtlas(question: string) {
  const context = await buildAtlasContext();

  const prompt = buildAtlasPrompt(
    context,
    question
  );

  return {
    context,
    prompt,
  };
}