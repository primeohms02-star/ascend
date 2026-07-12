import { askAtlas } from "@/lib/services/atlas";
import { askGroq } from "@/lib/groq/chat";

import { saveAtlasMemory } from "@/lib/supabase/atlasMemory";

import {
  saveKnowledge,
  getKnowledge,
} from "@/lib/supabase/atlasKnowledge";

import {
  saveReflection,
  getReflections,
} from "@/lib/supabase/atlasReflections";

import { saveIdentity } from "@/lib/supabase/atlasIdentity";

import { runCognition } from "@/lib/atlas/cognition";

export async function runAtlas(
  userId: string,
  question: string
) {
  // Save user message
  await saveAtlasMemory(
    userId,
    "user",
    question
  );

  // Existing knowledge
  const storedKnowledge =
    await getKnowledge(userId);

  const knowledgeText = storedKnowledge
    .map(
      (item) =>
        `${item.category}: ${item.fact}`
    )
    .join("\n");

  // Existing reflections
  const reflections =
    await getReflections(userId);

  const reflectionText =
    reflections
      .map(
        (item) => item.reflection
      )
      .join("\n");

  // One Cognitive AI Call
  const cognition =
    await runCognition(
      question,
      knowledgeText,
      reflectionText
    );

  // Save knowledge
  for (const item of cognition.knowledge) {
    await saveKnowledge(
      userId,
      item.category,
      item.fact
    );
  }

  // Save reflection
  if (cognition.reflection) {
    await saveReflection(
      userId,
      cognition.reflection
    );
  }

  // Save identity
  await saveIdentity(
    userId,
    cognition.identity.title,
    cognition.identity.description
  );

  // Build Atlas prompt
  const atlas = await askAtlas(question);

  // Ask Groq for response
  const answer =
    await askGroq(atlas.prompt);

  // Save Atlas reply
  await saveAtlasMemory(
    userId,
    "atlas",
    answer
  );

  return {
    answer,
    context: atlas.context,
  };
}