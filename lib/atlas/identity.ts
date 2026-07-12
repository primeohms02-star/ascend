import { askGroq } from "@/lib/groq/chat";

export async function generateIdentity(
  knowledge: string,
  reflections: string
) {
  const prompt = `
You are Atlas.

Based on the user's knowledge and reflections, determine who this person is becoming.

Return your answer in EXACTLY this format:

TITLE:
<short identity title>

DESCRIPTION:
<one paragraph describing who the user is becoming>

Knowledge:
${knowledge}

Reflections:
${reflections}
`;

  return await askGroq(prompt);
}