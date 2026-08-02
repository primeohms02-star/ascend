import { Opportunity } from "../types";
import { OpportunityConnector } from "./types";

const SCHOLARSHIP_REGION_FEED =
  "https://www.scholarshipregion.com/feed/";

const REQUEST_HEADERS = {
  Accept:
    "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
  "User-Agent":
    "Mozilla/5.0 (compatible; ASCEND-Opportunity-Engine/1.0; +https://ascendai.space)",
};

function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code))
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCharCode(parseInt(code, 16))
    )
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(value = ""): string {
  return decodeEntities(value)
    .replace(
      /<script[^>]*>[\s\S]*?<\/script>/gi,
      " "
    )
    .replace(
      /<style[^>]*>[\s\S]*?<\/style>/gi,
      " "
    )
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getXmlValue(
  block: string,
  tag: string
): string {
  const escapedTag = tag.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const match = new RegExp(
    `<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`,
    "i"
  ).exec(block);

  return match?.[1] ?? "";
}

function getCategories(
  block: string
): string[] {
  return Array.from(
    block.matchAll(
      /<category(?:\s[^>]*)?>([\s\S]*?)<\/category>/gi
    ),
    (match) => cleanText(match[1])
  ).filter(Boolean);
}

function createId(
  guid: string,
  url: string
): string {
  const postId =
    /[?&]p=(\d+)/i.exec(guid)?.[1];

  if (postId) {
    return `scholarshipregion-${postId}`;
  }

  let hash = 0;

  for (const character of url) {
    hash =
      (hash * 31 +
        character.charCodeAt(0)) |
      0;
  }

  return `scholarshipregion-${Math.abs(hash)}`;
}

function detectCategory(
  text: string
): string {
  const value = text.toLowerCase();

  if (value.includes("fellowship")) {
    return "fellowship";
  }

  if (value.includes("internship")) {
    return "internship";
  }

  if (value.includes("competition")) {
    return "competition";
  }

  if (value.includes("grant")) {
    return "grant";
  }

  if (
    value.includes("course") ||
    value.includes("training")
  ) {
    return "course";
  }

  return "scholarship";
}

function isOpportunity(
  text: string
): boolean {
  return /\b(scholarship|fellowship|internship|grant|competition|award|bursary|funded programme|funded program)\b/i.test(
    text
  );
}

function detectLocation(
  text: string
): string {
  if (/\bnigeria(?:n)?\b/i.test(text)) {
    return "Nigeria";
  }

  if (/\bafrica(?:n)?\b/i.test(text)) {
    return "Africa";
  }

  return "Global";
}

function buildTags(
  text: string,
  category: string,
  categories: string[]
): string[] {
  const value = text.toLowerCase();

  const tags = new Set<string>([
    category,
    "Nigerian Source",
  ]);

  for (
    const categoryName of categories.slice(0, 6)
  ) {
    tags.add(categoryName);
  }

  if (value.includes("fully funded")) {
    tags.add("Fully Funded");
  }

  if (value.includes("undergraduate")) {
    tags.add("Undergraduate");
  }

  if (
    value.includes("masters") ||
    value.includes("master's")
  ) {
    tags.add("Masters");
  }

  if (
    value.includes("phd") ||
    value.includes("doctoral")
  ) {
    tags.add("PhD");
  }

  if (/\bnigeria(?:n)?\b/.test(value)) {
    tags.add("Nigeria");
  }

  if (/\bafrica(?:n)?\b/.test(value)) {
    tags.add("Africa");
  }

  return Array.from(tags);
}

function mapFeedItem(
  block: string
): Opportunity | null {
  const title = cleanText(
    getXmlValue(block, "title")
  );

  const url = decodeEntities(
    getXmlValue(block, "link")
  );

  const guid = decodeEntities(
    getXmlValue(block, "guid")
  );

  const description = cleanText(
    getXmlValue(block, "description")
  );

  const categories =
    getCategories(block);

  const searchable = [
    title,
    description,
    ...categories,
  ].join(" ");

  if (
    !title ||
    !url ||
    !isOpportunity(searchable)
  ) {
    return null;
  }

  const category =
    detectCategory(searchable);

  return {
    id: createId(guid, url),

    title,

    company: "Scholarship Region",

    description,

    category,

    source: "scholarshipregion",

    location:
      detectLocation(searchable),

    remote: false,

    url,

    tags: buildTags(
      searchable,
      category,
      categories
    ),
  };
}

async function fetchScholarshipRegion(): Promise<
  Opportunity[]
> {
  try {
    const response = await fetch(
      SCHOLARSHIP_REGION_FEED,
      {
        headers: REQUEST_HEADERS,
        redirect: "follow",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "Scholarship Region feed error:",
        response.status
      );

      return [];
    }

    const xml =
      await response.text();

    const blocks =
      xml.match(
        /<item\b[\s\S]*?<\/item>/gi
      ) ?? [];

    if (blocks.length === 0) {
      console.error(
        "Scholarship Region returned unexpected content:",
        xml.slice(0, 300)
      );

      return [];
    }

    const unique = new Map<
      string,
      Opportunity
    >();

    for (const block of blocks) {
      const opportunity =
        mapFeedItem(block);

      if (opportunity) {
        unique.set(
          opportunity.id,
          opportunity
        );
      }
    }

    return Array.from(
      unique.values()
    );
  } catch (error) {
    console.error(
      "Scholarship Region fetch failed:",
      error
    );

    return [];
  }
}

export const ScholarshipRegionConnector: OpportunityConnector =
  {
    name:
      "Scholarship Region Nigeria",

    fetch:
      fetchScholarshipRegion,

    async getOpportunityById(
      id: string
    ): Promise<Opportunity | null> {
      const opportunities =
        await fetchScholarshipRegion();

      return (
        opportunities.find(
          (opportunity) =>
            opportunity.id === id
        ) ?? null
      );
    },
  };