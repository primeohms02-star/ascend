import { auth } from "@clerk/nextjs/server";

import { buildAtlasContext } from "@/lib/atlas/context";
import { buildAtlasPrompt } from "@/lib/atlas/prompt";

import { getAtlasMemory } from "@/lib/supabase/atlasMemory";

export async function askAtlas(question: string) {
  const context = await buildAtlasContext();

  const { userId } = await auth();

  let previousConversation = "";

  if (userId) {
    const history = await getAtlasMemory(userId);

    previousConversation = history
      .map(
        (item) =>
          `${item.role.toUpperCase()}: ${item.message}`
      )
      .join("\n");
  }

  const prompt = `
Previous Conversation

${previousConversation}

-------------------------

${buildAtlasPrompt(context, question)}
`;

  return {
    context,
    prompt,
  };
}