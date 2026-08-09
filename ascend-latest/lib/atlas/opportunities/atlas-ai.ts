import { askAtlas } from "@/lib/atlas/ai/ollama";

export async function rewriteOpportunity(
  description: string
): Promise<string> {
  const shortenedDescription = description.slice(0, 2500);

  const prompt = `
You are ATLAS, the intelligence engine inside ASCEND.

Analyze the opportunity below and return only this concise structure:

Overview:
Write 2 short sentences.

Key Responsibilities:
- Maximum 4 bullet points.

Top Requirements:
- Maximum 4 bullet points.

Should You Apply:
Write 2 short sentences explaining who this opportunity suits.

Rules:
- Be concise.
- Do not repeat information.
- Do not include HTML.
- Do not include navigation, cookie notices, forms, or website text.
- Do not add information that is not present in the opportunity.
- Keep the entire response below 220 words.

Opportunity:

${shortenedDescription}
`;

  return await askAtlas(prompt);
}