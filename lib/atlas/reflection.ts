import { askGroq } from "@/lib/groq/chat";

export async function generateReflection(
  knowledge: string,
  conversation: string
) {
  const prompt = `
You are Atlas.

Based on the user's knowledge and recent conversation,
write ONE short coaching observation.

Do NOT repeat facts.

Instead, identify a pattern or insight.

Knowledge:
${knowledge}

Conversation:
${conversation}

Return only the reflection.
`;

  return await askGroq(prompt);
}