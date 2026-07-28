import { Opportunity } from "../types";
import { OpportunityConnector } from "./types";

const API_URL =
  "https://opportunityforafrica.org/wp-json/wp/v2/posts";

type WordPressPost = {
  id: number;
  link?: string;
  title?: {
    rendered?: string;
  };
  excerpt?: {
    rendered?: string;
  };
  content?: {
    rendered?: string;
  };
};

function cleanText(value?: string): string {
  return (value ?? "")
    .replace(
      /<script[^>]*>[\s\S]*?<\/script>/gi,
      " "
    )
    .replace(
      /<style[^>]*>[\s\S]*?<\/style>/gi,
      " "
    )
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/\s+/g, " ")
    .trim();
}

function detectCategory(text: string): string {
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
    value.includes("graduate programme") ||
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
    value.includes("bootcamp") ||
    value.includes("certification")
  ) {
    return "course";
  }

  if (
    value.includes("job") ||
    value.includes("hiring") ||
    value.includes("vacancy") ||
    value.includes("consultant")
  ) {
    return "job";
  }

  return "program";
}

function detectLocation(text: string): string {
  const value = text.toLowerCase();

  if (
    value.includes("nigeria") ||
    value.includes("nigerian")
  ) {
    return "Nigeria";
  }

  if (
    value.includes("remote") ||
    value.includes("virtual") ||
    value.includes("online")
  ) {
    return "Remote";
  }

  if (
    value.includes("africa") ||
    value.includes("african")
  ) {
    return "Africa";
  }

  return "Africa / Global";
}

function extractDeadline(
  text: string
): string | undefined {
  const patterns = [
    /deadline\s*[:\-–]\s*([^.|\n]{4,70})/i,
    /application deadline\s*[:\-–]\s*([^.|\n]{4,70})/i,
    /closes?\s+(?:on\s+)?([^.|\n]{4,50})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return undefined;
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
    ["software", "Software"],
    ["entrepreneur", "Entrepreneurship"],
    ["startup", "Startups"],
    ["business", "Business"],
    ["research", "Research"],
    ["leadership", "Leadership"],
    ["climate", "Climate"],
    ["health", "Health"],
    ["education", "Education"],
    ["agriculture", "Agriculture"],
    ["finance", "Finance"],
    ["women", "Women"],
    ["youth", "Youth"],
    ["graduate", "Graduate"],
  ];

  for (const [keyword, tag] of possibleTags) {
    if (value.includes(keyword)) {
      tags.add(tag);
    }
  }

  return Array.from(tags);
}

function mapPost(
  post: WordPressPost
): Opportunity {
  const title = cleanText(
    post.title?.rendered
  );

  const description = cleanText(
    post.content?.rendered ||
      post.excerpt?.rendered
  );

  const searchableText =
    `${title} ${description}`;

  const category =
    detectCategory(searchableText);

  const normalizedText =
    searchableText.toLowerCase();

  return {
    id: String(post.id),

    title:
      title ||
      "Opportunity for Africans",

    company: "Opportunity for Africa",

    description,

    category,

    source: "opportunityforafrica",

    location:
      detectLocation(searchableText),

    remote:
      normalizedText.includes("remote") ||
      normalizedText.includes("virtual") ||
      normalizedText.includes("online"),

    deadline:
      extractDeadline(searchableText),

    url: post.link,

    tags: buildTags(
      searchableText,
      category
    ),
  };
}

async function fetchPosts(): Promise<
  Opportunity[]
> {
  try {
    const response = await fetch(
      `${API_URL}?per_page=30&orderby=date&order=desc`,
      {
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 21600,
        },
      }
    );

    if (!response.ok) {
      console.error(
        "Opportunity for Africa API error:",
        response.status
      );

      return [];
    }

    const posts =
      (await response.json()) as WordPressPost[];

    if (!Array.isArray(posts)) {
      return [];
    }

    return posts.map(mapPost);
  } catch (error) {
    console.error(
      "Opportunity for Africa fetch failed:",
      error
    );

    return [];
  }
}

async function fetchPostById(
  id: string
): Promise<Opportunity | null> {
  try {
    const response = await fetch(
      `${API_URL}/${encodeURIComponent(id)}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 21600,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const post =
      (await response.json()) as WordPressPost;

    return mapPost(post);
  } catch (error) {
    console.error(
      "Opportunity for Africa lookup failed:",
      error
    );

    return null;
  }
}

export const OpportunityForAfricaConnector: OpportunityConnector =
  {
    name: "Opportunity for Africa",

    async fetch(): Promise<Opportunity[]> {
      return fetchPosts();
    },

    async getOpportunityById(
      id: string
    ): Promise<Opportunity | null> {
      return fetchPostById(id);
    },
  };