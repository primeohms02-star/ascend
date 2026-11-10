import { safePublicLink } from "./types";
export type Source = {
  title: string;
  url: string;
  excerpt: string;
  published: string | null;
};
export type Research = {
  status:
    | "not_requested"
    | "ready"
    | "unavailable"
    | "no_results"
    | "limit"
    | "needs_topic";
  sources: Source[];
  checked: string;
};
export function publicTopic(message: string) {
  // Only these public subject words may be derived automatically. Never transmit a user's message, name, history, or profile to search.
  const vocabulary = [
    "fashion",
    "design",
    "portfolio",
    "music",
    "business",
    "marketing",
    "finance",
    "software",
    "engineering",
    "technology",
    "programming",
    "entrepreneurship",
    "customer research",
    "scholarship",
    "internship",
    "fellowship",
    "training",
    "mentorship",
    "education",
    "career",
    "Nigeria",
    "Africa",
    "remote",
    "university",
    "data science",
    "healthcare",
    "agriculture",
    "photography",
    "art",
    "writing",
    "research methods",
    "competition",
    "computer science",
    "graphic design",
    "animation",
  ];
  return vocabulary
    .filter((term) => new RegExp("\\b" + term + "s?\\b", "i").test(message))
    .slice(0, 8)
    .join(" ");
}
export function readResults(data: { results?: unknown }) {
  const sources: Source[] = [];
  for (const row of Array.isArray(data.results) ? data.results : []) {
    const url = safePublicLink(row?.url);
    if (
      !url ||
      sources.some((s) => s.url === url) ||
      typeof row.title !== "string" ||
      !row.title.trim() ||
      typeof row.content !== "string" ||
      !row.content.trim()
    )
      continue;
    sources.push({
      title: row.title.slice(0, 160),
      url,
      excerpt: row.content.slice(0, 950),
      published:
        typeof row.published_date === "string"
          ? row.published_date.slice(0, 60)
          : null,
    });
  }
  return sources.slice(0, 5);
}
