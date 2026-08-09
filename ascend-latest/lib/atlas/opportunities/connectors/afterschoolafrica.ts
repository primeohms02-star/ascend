import { Opportunity } from "../types";
import { OpportunityConnector } from "./types";

const API_URL =
  "https://www.afterschoolafrica.com/wp-json/wp/v2/posts";

const REQUEST_HEADERS = {
  Accept: "application/json",

  "User-Agent":
    "Mozilla/5.0 (compatible; ASCEND-Opportunity-Engine/1.0; +https://www.ascendai.space)",

  Referer:
    "https://www.afterschoolafrica.com/",
};

type WordPressTerm = {
  name?: string;
  taxonomy?: string;
};

type WordPressPost = {
  id: number;

  link: string;

  date?: string;

  title?: {
    rendered?: string;
  };

  excerpt?: {
    rendered?: string;
  };

  content?: {
    rendered?: string;
  };

  _embedded?: {
    "wp:term"?: WordPressTerm[][];
  };
};

function decodeEntities(
  value: string
): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#039;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#8211;/gi, "–")
    .replace(/&#8212;/gi, "—")
    .replace(/&#8216;/gi, "‘")
    .replace(/&#8217;/gi, "’")
    .replace(/&#8220;/gi, "“")
    .replace(/&#8221;/gi, "”")
    .replace(/&#8230;/gi, "…")
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
      .replace(/\s+/g, " ")
      .trim()
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
    value.includes("intern ")
  ) {
    return "internship";
  }

  if (
    value.includes("grant") ||
    value.includes("funding") ||
    value.includes("fund ")
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
    value.includes("contest") ||
    value.includes("award")
  ) {
    return "competition";
  }

  if (
    value.includes("hackathon") ||
    value.includes("challenge")
  ) {
    return "hackathon";
  }

  if (
    value.includes("volunteer") ||
    value.includes("volunteering")
  ) {
    return "volunteering";
  }

  if (
    value.includes("mentorship") ||
    value.includes("mentoring")
  ) {
    return "mentorship";
  }

  if (
    value.includes("course") ||
    value.includes("training") ||
    value.includes("workshop") ||
    value.includes("bootcamp")
  ) {
    return "course";
  }

  if (
    value.includes("conference") ||
    value.includes("summit") ||
    value.includes("programme") ||
    value.includes("program")
  ) {
    return "programme";
  }

  return "programme";
}

function findDeadline(
  text: string
): string | undefined {
  const patterns = [
    /application deadline\s*:?\s*([a-z]+\s+\d{1,2},?\s+\d{4})/i,

    /deadline\s*:?\s*([a-z]+\s+\d{1,2},?\s+\d{4})/i,

    /deadline\s*:?\s*(\d{1,2}\s+[a-z]+\s+\d{4})/i,

    /closes?\s*:?\s*([a-z]+\s+\d{1,2},?\s+\d{4})/i,

    /applications close\s*:?\s*([a-z]+\s+\d{1,2},?\s+\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return undefined;
}

function getTerms(
  post: WordPressPost
): string[] {
  const groups =
    post._embedded?.["wp:term"] ?? [];

  return groups
    .flat()
    .map((term) =>
      cleanText(term.name)
    )
    .filter(Boolean);
}

function buildTags(
  text: string,
  category: string,
  terms: string[]
): string[] {
  const value = text.toLowerCase();

  const tags = new Set<string>([
    category,
    "Africa",
  ]);

  for (const term of terms) {
    tags.add(term);
  }

  const possibleTags: Array<
    [string, string]
  > = [
    ["nigeria", "Nigeria"],
    ["remote", "Remote"],
    ["virtual", "Remote"],
    ["online", "Online"],
    ["fully funded", "Fully Funded"],
    ["undergraduate", "Undergraduate"],
    ["masters", "Masters"],
    ["master's", "Masters"],
    ["phd", "PhD"],
    ["postdoctoral", "Postdoctoral"],
    ["graduate", "Graduate"],
    ["women", "Women"],
    ["youth", "Youth"],
    ["technology", "Technology"],
    ["software", "Software"],
    ["data", "Data"],
    ["artificial intelligence", "AI"],
    ["machine learning", "AI"],
    ["business", "Business"],
    ["entrepreneur", "Entrepreneurship"],
    ["leadership", "Leadership"],
    ["research", "Research"],
    ["engineering", "Engineering"],
    ["health", "Healthcare"],
    ["education", "Education"],
    ["agriculture", "Agriculture"],
    ["climate", "Climate"],
    ["finance", "Finance"],
    ["media", "Media"],
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

function mapPost(
  post: WordPressPost
): Opportunity | null {
  const title = cleanText(
    post.title?.rendered
  );

  const url = post.link?.trim();

  if (!title || !url) {
    return null;
  }

  const content = cleanText(
    post.content?.rendered
  );

  const excerpt = cleanText(
    post.excerpt?.rendered
  );

  const description =
    content || excerpt;

  const terms = getTerms(post);

  const searchable = [
    title,
    description,
    ...terms,
  ].join(" ");

  const category =
    detectCategory(searchable);

  const normalized =
    searchable.toLowerCase();

  return {
    id: `afterschoolafrica-${post.id}`,

    title,

    company: "After School Africa",

    description,

    category,

    source: "afterschoolafrica",

    location:
      normalized.includes("nigeria")
        ? "Nigeria"
        : "Africa / Global",

    remote:
      normalized.includes("remote") ||
      normalized.includes("virtual") ||
      normalized.includes("online"),

    deadline:
      findDeadline(searchable),

    url,

    tags: buildTags(
      searchable,
      category,
      terms
    ),
  };
}

async function fetchPage(
  page: number
): Promise<WordPressPost[]> {
  const parameters =
    new URLSearchParams({
      per_page: "50",
      page: String(page),
      _embed: "wp:term",
      _fields:
        "id,link,date,title,excerpt,content,_embedded",
    });

  const response = await fetch(
    `${API_URL}?${parameters.toString()}`,
    {
      headers: REQUEST_HEADERS,
      redirect: "follow",
      cache: "no-store",
    }
  );

  console.log(
    `After School Africa page ${page}:`,
    response.status,
    response.headers.get("content-type")
  );

  if (!response.ok) {
    console.error(
      `After School Africa page ${page} error:`,
      response.status
    );

    return [];
  }

  const data: unknown =
    await response.json();

  if (!Array.isArray(data)) {
    console.error(
      "After School Africa returned an invalid response."
    );

    return [];
  }

  return data as WordPressPost[];
}

async function fetchAfterSchoolAfrica(): Promise<
  Opportunity[]
> {
  try {
    // Fetch both pages simultaneously.
    const pages = await Promise.all([
      fetchPage(1),
      fetchPage(2),
    ]);

    const posts = pages.flat();

    console.log(
      "After School Africa posts found:",
      posts.length
    );

    const opportunities = posts
      .map(mapPost)
      .filter(
        (
          opportunity
        ): opportunity is Opportunity =>
          opportunity !== null
      );

    const unique = new Map<
      string,
      Opportunity
    >();

    for (
      const opportunity of opportunities
    ) {
      unique.set(
        opportunity.id,
        opportunity
      );
    }

    const results = Array.from(
      unique.values()
    );

    console.log(
      "After School Africa valid opportunities:",
      results.length
    );

    return results;
  } catch (error) {
    console.error(
      "After School Africa fetch failed:",
      error
    );

    return [];
  }
}

export const AfterSchoolAfricaConnector: OpportunityConnector =
  {
    name: "After School Africa",

    async fetch(): Promise<
      Opportunity[]
    > {
      return fetchAfterSchoolAfrica();
    },

    async getOpportunityById(
      id: string
    ): Promise<Opportunity | null> {
      const opportunities =
        await fetchAfterSchoolAfrica();

      return (
        opportunities.find(
          (opportunity) =>
            opportunity.id === id
        ) ?? null
      );
    },
  };