export type ExtractedOpportunity = {
  overview: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
};

export function extractOpportunity(
  raw: string
): ExtractedOpportunity {

  const text = raw.replace(/\r/g, "");

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let overview = "";

  const responsibilities: string[] = [];
  const requirements: string[] = [];
  const benefits: string[] = [];

  let section: "overview" | "responsibilities" | "requirements" | "benefits" =
    "overview";

  for (const line of lines) {

    const lower = line.toLowerCase();

    if (
      lower.includes("responsibil") ||
      lower.includes("what you'll do") ||
      lower.includes("duties")
    ) {
      section = "responsibilities";
      continue;
    }

    if (
      lower.includes("requirement") ||
      lower.includes("qualification") ||
      lower.includes("skills required") ||
      lower.includes("what we're looking for")
    ) {
      section = "requirements";
      continue;
    }

    if (
      lower.includes("benefits") ||
      lower.includes("what we offer") ||
      lower.includes("perks")
    ) {
      section = "benefits";
      continue;
    }

    switch (section) {

      case "overview":
        overview += line + " ";
        break;

      case "responsibilities":
        responsibilities.push(line);
        break;

      case "requirements":
        requirements.push(line);
        break;

      case "benefits":
        benefits.push(line);
        break;
    }
  }

  return {
    overview: overview.trim(),
    responsibilities,
    requirements,
    benefits,
  };
}