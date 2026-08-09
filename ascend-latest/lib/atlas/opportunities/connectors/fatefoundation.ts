import type { Opportunity } from "../types";
import type { OpportunityConnector } from "./types";

const API_URL = "https://fatefoundation.org/wp-json/wp/v2/posts";
const SEARCH_TERMS = [
  "applications",
  "entrepreneurship programme",
  "accelerator",
  "business grant",
  "incubation programme",
];
const USER_AGENT =
  "Mozilla/5.0 (compatible; ASCEND-Opportunity-Engine/1.0; +https://ascendai.space)";
const MAX_POST_AGE_DAYS = 365;

type FatePost = {
  id: number;
  date?: string;
  link?: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
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
  if (/\baccelerator|incubator|incubation\b/i.test(text)) return "Accelerator";
  if (/\bcompetition|award|challenge\b/i.test(text)) return "Competition";
  if (/\btraining|course|workshop|masterclass\b/i.test(text)) return "Course";
  return "Programme";
}

function toOpportunity(post: FatePost): Opportunity | null {
  const title = clean(post.title?.rendered);
  const description = clean(post.excerpt?.rendered);
  const text = `${title} ${description}`;
  const url = post.link?.trim() ?? "";

  if (
    !title ||
    !url ||
    !isRecent(post.date) ||
    !/\b(?:applications?|apply|programme|program|accelerator|incubator|incubation|grant|funding|competition|training|entrepreneur)\b/i.test(text)
  ) {
    return null;
  }

  const category = detectCategory(text);

  return {
    id: `fatefoundation-${post.id}`,
    title,
    company: "FATE Foundation",
    description:
      description.slice(0, 1000) ||
      "A Nigerian entrepreneurship and business-development opportunity from FATE Foundation.",
    category,
    source: "fatefoundation",
    location: "Nigeria",
    remote: /\bonline|virtual|remote\b/i.test(text),
    url,
    tags: [
      "Business",
      "Entrepreneurship",
      "Nigeria",
      "Africa",
      category,
    ],
  };
}

async function fetchSearch(search: string): Promise<FatePost[]> {
  const url = new URL(API_URL);
  url.searchParams.set("search", search);
  url.searchParams.set("per_page", "25");
  url.searchParams.set("orderby", "date");
  url.searchParams.set("order", "desc");
  url.searchParams.set("_fields", "id,date,link,title,excerpt");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`FATE Foundation API returned ${response.status}`);
  }

  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as FatePost[]) : [];
}

async function fetchAll(): Promise<Opportunity[]> {
  try {
    const posts = new Map<number, FatePost>();
    const results = await Promise.all(SEARCH_TERMS.map(fetchSearch));
    for (const post of results.flat()) posts.set(post.id, post);

    return Array.from(posts.values())
      .map(toOpportunity)
      .filter((item): item is Opportunity => item !== null);
  } catch (error) {
    console.error("FATE Foundation fetch failed:", error);
    return [];
  }
}

async function getById(id: string): Promise<Opportunity | null> {
  const numericId = id.replace(/^fatefoundation-/, "").trim();
  if (!/^\d+$/.test(numericId)) return null;

  try {
    const response = await fetch(
      `${API_URL}/${numericId}?_fields=id,date,link,title,excerpt`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": USER_AGENT,
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) return null;
    return toOpportunity((await response.json()) as FatePost);
  } catch (error) {
    console.error("FATE Foundation lookup failed:", error);
    return null;
  }
}

export const FateFoundationConnector: OpportunityConnector = {
  name: "FATE Foundation",
  fetch: fetchAll,
  getOpportunityById: getById,
};
