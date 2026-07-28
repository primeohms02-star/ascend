import { Opportunity } from "../types";
import { OpportunityConnector } from "./types";

const FEED_URL =
  "https://opportunitydesk.org/feed/";

const REQUEST_HEADERS = {
  Accept:
    "application/rss+xml, application/xml, text/xml",

  "User-Agent":
    "ASCEND-Opportunity-Engine/1.0 (+https://www.ascendai.space)",
};

function decodeEntities(
  value: string
): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(
  value?: string
): string {
  return decodeEntities(
    (value ?? "")
      .replace(
        /<script[^>]*>[\s\S]*?<\/script>/gi,
        " "
      )
      .replace(
        /<style[^>]*>[\s\S]*?<\/style>/gi,
        " "
      )
      .replace(/<[^>]+>/g, " ")
  );
}

function getXmlValue(
  block: string,
  tag: string
): string {
  const escapedTag =
    tag.replace(":", "\\:");

  const expression = new RegExp(
    `<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`,
    "i"
  );

  return (
    expression.exec(block)?.[1] ?? ""
  );
}

function createFallbackId(
  value: string
): string {
  let hash = 0;

  for (
    let index = 0;
    index < value.length;
    index++
  ) {
    hash =
      (hash * 31 +
        value.charCodeAt(index)) |
      0;
  }

  return `rss-${Math.abs(hash)}`;
}

function extractId(
  block: string,
  link: string
): string {
  const guid = decodeEntities(
    getXmlValue(block, "guid")
  );

  const numericId =
    guid.match(
      /[?&]p=(\d+)/i
    )?.[1];

  return (
    numericId ||
    createFallbackId(link)
  );
}

function detectCategory(
  text: string
): string {
  const value = text.toLowerCase();

  if (
    value.includes("scholarship") ||
    value.includes("bursary") ||
    value.includes("studentship")
  ) {
    return "scholarship";
  }

  if (value.includes("fellowship")) {
    return "fellowship";
  }

  if (
    value.includes("internship") ||
    value.includes("traineeship") ||
    value.includes("graduate program")
  ) {
    return "internship";
  }

  if (
    value.includes("grant") ||
    value.includes("funding")
  ) {
    return "grant";
  }

  if (
    value.includes("accelerator") ||
    value.includes("incubator")
  ) {
    return "accelerator";
  }

  if (
    value.includes("competition") ||
    value.includes("challenge") ||
    value.includes("award") ||
    value.includes("prize")
  ) {
    return "competition";
  }

  if (value.includes("hackathon")) {
    return "hackathon";
  }

  if (
    value.includes("mentorship") ||
    value.includes("mentoring")
  ) {
    return "mentorship";
  }

  if (
    value.includes("volunteer") ||
    value.includes("volunteering")
  ) {
    return "volunteering";
  }

  if (
    value.includes("course") ||
    value.includes("training") ||
    value.includes("bootcamp")
  ) {
    return "course";
  }

  if (
    value.includes("job") ||
    value.includes("hiring") ||
    value.includes("vacancy")
  ) {
    return "job";
  }

  return "program";
}

function detectLocation(
  text: string
): string {
  const value = text.toLowerCase();

  if (
    value.includes("nigeria") ||
    value.includes("nigerian")
  ) {
    return "Nigeria";
  }

  if (
    value.includes("africa") ||
    value.includes("african")
  ) {
    return "Africa";
  }

  if (
    value.includes("remote") ||
    value.includes("online") ||
    value.includes("virtual")
  ) {
    return "Remote";
  }

  return "Africa / Global";
}

function extractDeadline(
  text: string
): string | undefined {
  return text
    .match(
      /deadline\s*[:\-–]\s*([^.|\n]{4,70})/i
    )?.[1]
    ?.trim();
}

function buildTags(
  text: string,
  category: string
): string[] {
  const value = text.toLowerCase();

  const tags = new Set<string>([
    category,
    "Africa",
  ]);

  const possibleTags = [
    ["nigeria", "Nigeria"],
    ["remote", "Remote"],
    ["fully funded", "Fully Funded"],
    ["technology", "Technology"],
    ["artificial intelligence", "AI"],
    ["entrepreneur", "Entrepreneurship"],
    ["startup", "Startups"],
    ["business", "Business"],
    ["research", "Research"],
    ["leadership", "Leadership"],
    ["climate", "Climate"],
    ["health", "Health"],
    ["education", "Education"],
    ["women", "Women"],
    ["youth", "Youth"],
  ];

  for (
    const [keyword, tag] of possibleTags
  ) {
    if (value.includes(keyword)) {
      tags.add(tag);
    }
  }

  return Array.from(tags);
}

function mapItem(
  block: string
): Opportunity | null {
  const title = cleanText(
    getXmlValue(block, "title")
  );

  const link = decodeEntities(
    getXmlValue(block, "link")
  );

  const description = cleanText(
    getXmlValue(
      block,
      "content:encoded"
    ) ||
      getXmlValue(
        block,
        "description"
      )
  );

  if (!title || !link) {
    return null;
  }

  const searchable =
    `${title} ${description}`;

  const normalized =
    searchable.toLowerCase();

  const category =
    detectCategory(searchable);

  return {
    id: extractId(block, link),
    title,
    company: "Opportunity Desk",
    description,
    category,
    source: "opportunitydesk",
    location:
      detectLocation(searchable),

    remote:
      normalized.includes("remote") ||
      normalized.includes("online") ||
      normalized.includes("virtual"),

    deadline:
      extractDeadline(searchable),

    url: link,

    tags: buildTags(
      searchable,
      category
    ),
  };
}

async function fetchFeedPage(
  page: number
): Promise<Opportunity[]> {
  const url =
    page === 1
      ? FEED_URL
      : `${FEED_URL}?paged=${page}`;

  try {
    const response = await fetch(
      url,
      {
        headers: REQUEST_HEADERS,

        next: {
          revalidate: 21600,
        },
      }
    );

    if (!response.ok) {
      console.error(
        `Opportunity Desk RSS page ${page} error:`,
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

    return blocks
      .map(mapItem)
      .filter(
        (
          opportunity
        ): opportunity is Opportunity =>
          opportunity !== null
      );
  } catch (error) {
    console.error(
      `Opportunity Desk RSS page ${page} failed:`,
      error
    );

    return [];
  }
}

async function fetchPosts(): Promise<
  Opportunity[]
> {
  const results =
    await Promise.allSettled([
      fetchFeedPage(1),
      fetchFeedPage(2),
      fetchFeedPage(3),
    ]);

  const opportunities =
    results.flatMap((result) =>
      result.status === "fulfilled"
        ? result.value
        : []
    );

  const unique = new Map<
    string,
    Opportunity
  >();

  for (const opportunity of opportunities) {
    unique.set(
      opportunity.id,
      opportunity
    );
  }

  return Array.from(
    unique.values()
  );
}

export const OpportunityDeskConnector: OpportunityConnector =
  {
    name: "Opportunity Desk",

    async fetch(): Promise<
      Opportunity[]
    > {
      return fetchPosts();
    },

    async getOpportunityById(
      id: string
    ): Promise<Opportunity | null> {
      const opportunities =
        await fetchPosts();

      return (
        opportunities.find(
          (opportunity) =>
            opportunity.id === id
        ) ?? null
      );
    },
  };