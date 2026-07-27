export type ParsedOpportunity = {
  overview: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
};

export function parseOpportunityDescription(
  description: string
): ParsedOpportunity {

  const text = description.replace(/\s+/g, " ").trim();

  const responsibilities: string[] = [];
  const requirements: string[] = [];
  const benefits: string[] = [];

  const sentences = text.split(".");

  for (const sentence of sentences) {

    const s = sentence.trim();

    if (!s) continue;

    const lower = s.toLowerCase();

    if (
      lower.includes("responsible") ||
      lower.includes("duties") ||
      lower.includes("maintain") ||
      lower.includes("develop") ||
      lower.includes("design")
    ) {
      responsibilities.push(s);
      continue;
    }

    if (
      lower.includes("require") ||
      lower.includes("qualification") ||
      lower.includes("experience") ||
      lower.includes("degree") ||
      lower.includes("must")
    ) {
      requirements.push(s);
      continue;
    }

    if (
      lower.includes("benefit") ||
      lower.includes("offer") ||
      lower.includes("salary") ||
      lower.includes("insurance") ||
      lower.includes("leave")
    ) {
      benefits.push(s);
    }

  }

  return {
    overview: sentences[0]?.trim() ?? "",
    responsibilities,
    requirements,
    benefits,
  };

}