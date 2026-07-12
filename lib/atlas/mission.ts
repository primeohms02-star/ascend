import { askGroq } from "@/lib/groq/chat";

export async function generateMission(
  brain: string
) {
  const prompt = `
You are Atlas.

Your job is to choose the SINGLE highest-impact mission
for today.

Do NOT create a to-do list.

Return ONLY valid JSON.

Example:

{
  "mission":"Complete the onboarding flow for ASCEND.",
  "reason":"A working onboarding experience is the biggest blocker preventing user growth."
}

User Brain:

${brain}
`;

  const response = await askGroq(prompt);

  try {
    return JSON.parse(response);
  } catch {
    console.error(
      "Mission parse failed:",
      response
    );

    return {
      mission: "",
      reason: "",
    };
  }
}