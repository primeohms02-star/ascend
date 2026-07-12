import { askGroq } from "@/lib/groq/chat";

export async function extractKnowledgeAI(
  message: string
) {
  const prompt = `
You are Atlas.

Read the user's message.

Extract ONLY permanent facts that should be remembered.

Return ONLY valid JSON.

Example:

[
  {
    "category":"Project",
    "fact":"Building ASCEND"
  },
  {
    "category":"Goal",
    "fact":"Become financially independent"
  }
]

If nothing should be remembered return:

[]

User message:

${message}
`;

  const response = await askGroq(prompt);

  try {
    return JSON.parse(response);
  } catch {
    console.error(
      "Knowledge JSON parse failed:",
      response
    );

    return [];
  }
}