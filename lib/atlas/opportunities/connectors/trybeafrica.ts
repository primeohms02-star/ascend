import type { Opportunity } from "../types";
import type { OpportunityConnector } from "./types";

const API_URL =
  "https://trybeafrica.com/wp-json/wp/v2/mec-events";

const SEARCH_TERMS = [
  "music",
  "musician",
  "fashion",
  "designer",
  "creative entrepreneur",
  "creative business",
];

const USER_AGENT =
  "Mozilla/5.0 (compatible; ASCEND-Opportunity-Engine/1.0; +https://ascendai.space)";

const MAX_POST_AGE_DAYS = 365;

type TrybePost = {
  id: number;
  date?: string;
  link?: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
};

function clean(value = ""): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;|&#038;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isRecent(date?: string): boolean {
  if (!date) return false;

  const publishedAt = new Date(date).getTime();

  return (
    Number.isFinite(publishedAt) &&
    publishedAt >=
      Date.now() - MAX_POST_AGE_DAYS * 24 * 60 * 60 * 1000
  );
}

function detectCategory(text: string): string {
  if (/\bgrant|fund(?:ing)?\b/i.test(text)) return "Grant";
  if (/\bfellowship\b/i.test(text)) return "Fellowship";
  if (/\bcompetition|prize|award\b/i.test(text)) return "Competition";
  if (/\bresidenc(?:y|ies)\b/i.test(text)) return "Programme";
  if (/\baccelerator|incubator\b/i.test(text)) return "Accelerator";
  if (/\btraining|workshop|course|masterclass\b/i.test(text)) return "Course";
  if (/\binternship\b/i.test(text)) return "Internship";
  return "Programme";
}

function detectLocation(text: string): string {
  if (/\bnigeria|nigerian\b/i.test(text)) return "Nigeria";
  if (/\bafrica|african\b/i.test(text)) return "Africa";
  if (/\bworldwide|global|international\b/i.test(text)) return "Global";
  return "Africa / Global";
}

function buildTags(text: string, category: string): string[] {
  const tags = new Set<string>([
    category,
    "Creative Industries",
    "Africa",
  ]);

  if (/\bmusic|musician|singer|songwriter|producer|dj|sound\b/i.test(text)) {
    tags.add("Music");
  }

  if (/\bfashion|apparel|textile|garment|couture|designer\b/i.test(text)) {
    tags.add("Fashion");
  }

  if (/\bbusiness|entrepreneur|startup|enterprise|brand\b/i.test(text)) {
    tags.add("Business");
  }

  if (/\bnigeria|nigerian\b/i.test(text)) tags.add("Nigeria");
  if (/\bremote|online|virtual\b/i.test(text)) tags.add("Remote");

  return Array.from(tags);
}

function toOpportunity(post: TrybePost): Opportunity | null {
  const title = clean(post.title?.rendered);
  const description = clean(
    post.excerpt?.rendered || post.content?.rendered
  );
  const text = `${title} ${description}`;
  const url = post.link?.trim() ?? "";

  if (
    !title ||
    !url ||
    !isRecent(post.date) ||
    !/\b(?:grant|funding|fellowship|competition|prize|award|residency|accelerator|incubator|training|workshop|course|masterclass|internship|open call|call for applications)\b/i.test(text)
  ) {
    return null;
  }

  const category = detectCategory(text);
  const tags = buildTags(text, category);

  if (!tags.includes("Music") && !tags.includes("Fashion") && !tags.includes("Business")) {
    return null;
  }

  return {
    id: `trybeafrica-${post.id}`,
    title,
    company: "Trybe Africa",
    description:
      description.slice(0, 1000) ||
      "A creative-industry opportunity curated for African talent by Trybe Africa.",
    category,
    source: "trybeafrica",
    location: detectLocation(text),
    remote: /\bremote|online|virtual\b/i.test(text),
    url,
    tags,
  };
}

async function fetchSearch(search: string): Promise<TrybePost[]> {
  const url = new URL(API_URL);
  url.searchParams.set("search", search);
  url.searchParams.set("per_page", "30");
  url.searchParams.set("orderby", "date");
  url.searchParams.set("order", "desc");
  url.searchParams.set(
    "_fields",
    "id,date,link,title,excerpt,content"
  );

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
    next: { revalidate: 1800 },
  });

  if (!response.ok) {
    throw new Error(`Trybe Africa API returned ${response.status}`);
  }

  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as TrybePost[]) : [];
}

async function fetchAll(): Promise<Opportunity[]> {
  try {
    const posts = new Map<number, TrybePost>();
    const results = await Promise.all(SEARCH_TERMS.map(fetchSearch));

    for (const post of results.flat()) posts.set(post.id, post);

    return Array.from(posts.values())
      .map(toOpportunity)
      .filter((item): item is Opportunity => item !== null);
  } catch (error) {
    console.error("Trybe Africa fetch failed:", error);
    return [];
  }
}

async function getById(id: string): Promise<Opportunity | null> {
  const numericId = id.replace(/^trybeafrica-/, "").trim();
  if (!/^\d+$/.test(numericId)) return null;

  try {
    const response = await fetch(
      `${API_URL}/${numericId}?_fields=id,date,link,title,excerpt,content`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": USER_AGENT,
        },
        next: { revalidate: 1800 },
      }
    );

    if (!response.ok) return null;
    return toOpportunity((await response.json()) as TrybePost);
  } catch (error) {
    console.error("Trybe Africa lookup failed:", error);
    return null;
  }
}

export const TrybeAfricaConnector: OpportunityConnector = {
  name: "Trybe Africa",
  fetch: fetchAll,
  getOpportunityById: getById,
};
