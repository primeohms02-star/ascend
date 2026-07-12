import { askGroq } from "@/lib/groq/chat";

export async function generateStrategy(
  brain: string
) {
  const prompt = `
You are Atlas.

Using the user's Brain, create a strategic roadmap.

Return ONLY valid JSON.

Example:

{
  "vision":"...",
  "objective_90_day":"...",
  "monthly_plan":"...",
  "weekly_plan":"...",
  "today_mission":"..."
}

User Brain:

${brain}
`;

  const response = await askGroq(prompt);

  try {
    return JSON.parse(response);
  } catch {
    console.error(
      "Strategy parse failed:",
      response
    );

    return {
      vision: "",
      objective_90_day: "",
      monthly_plan: "",
      weekly_plan: "",
      today_mission: "",
    };
  }
}