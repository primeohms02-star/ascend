import { Opportunity } from "../types";
import { OpportunityConnector } from "./types";

const OPPORTUNITY_DESK_API =
  "https://opportunitydesk.org/wp-json/wp/v2/posts";

const REQUEST_HEADERS = {
  Accept: "application/json",

  "User-Agent":
    "ASCEND-Opportunity-Engine/1.0 (+https://www.ascendai.space)",

  Referer:
    "https://opportunitydesk.org/",
};

type WordPressText = {
  rendered?: string;
};

type OpportunityDeskPost = {
  id: number;
  date?: string;
  link?: string;
  title?: WordPressText;
  excerpt?: WordPressText;
  content?: WordPressText;
};

function decodeEntities(
  value: string
): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&hellip;/gi, "…")
    .replace(/&#8211;/gi, "–")
    .replace(/&#8212;/gi, "—")
    .replace(/&#8216;/gi, "'")
    .replace(/&#8217;/gi, "'")
    .replace(/&#8220;/gi, '"')
    .replace(/&#8221;/gi, '"');
}

function removeHtml(
  value?: string
): string {
  return decodeEntities(
    (value ?? "")
      .replace(
        /<style[^>]*>[\s\S]*?<\/style>/gi,
        " "
      )
      .replace(
        /<script[^>]*>[\s\S]*?<\/script>/gi,
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
  const normalized =
    text.toLowerCase();

  if (
    normalized.includes("scholarship") ||
    normalized.includes("studentship") ||
    normalized.includes("bursary")
  ) {
    return "scholarship";
  }

  if (
    normalized.includes("fellowship")
  ) {
    return "fellowship";
  }

  if (
    normalized.includes("internship") ||
    normalized.includes(
      "graduate trainee"
    ) ||
    normalized.includes(
      "graduate programme"
    ) ||
    normalized.includes(
      "graduate program"
    )
  ) {
    return "internship";
  }

  if (
    normalized.includes("grant") ||
    normalized.includes(
      "funding opportunity"
    ) ||
    normalized.includes(
      "funding programme"
    ) ||
    normalized.includes(
      "funding program"
    )
  ) {
    return "grant";
  }

  if (
    normalized.includes("accelerator") ||
    normalized.includes("incubator") ||
    normalized.includes(
      "startup program"
    ) ||
    normalized.includes(
      "startup programme"
    )
  ) {
    return "accelerator";
  }

  if (
    normalized.includes("competition") ||
    normalized.includes("challenge") ||
    normalized.includes("award") ||
    normalized.includes("prize")
  ) {
    return "competition";
  }

  if (
    normalized.includes("hackathon") ||
    normalized.includes("hack fest")
  ) {
    return "hackathon";
  }

  if (
    normalized.includes("mentorship") ||
    normalized.includes(
      "mentoring program"
    ) ||
    normalized.includes(
      "mentoring programme"
    )
  ) {
    return "mentorship";
  }

  if (
    normalized.includes("volunteer") ||
    normalized.includes("volunteering")
  ) {
    return "volunteering";
  }

  if (
    normalized.includes("course") ||
    normalized.includes("training") ||
    normalized.includes("bootcamp") ||
    normalized.includes(
      "certification"
    )
  ) {
    return "course";
  }

  if (
    normalized.includes("job") ||
    normalized.includes("vacancy") ||
    normalized.includes("hiring")
  ) {
    return "job";
  }

  return "program";
}

function detectLocation(
  text: string
): string {
  const normalized =
    text.toLowerCase();

  if (
    normalized.includes("nigeria") ||
    normalized.includes("nigerian")
  ) {
    return "Nigeria";
  }

  if (
    normalized.includes("africa") ||
    normalized.includes("african")
  ) {
    return "Africa";
  }

  if (
    normalized.includes("worldwide") ||
    normalized.includes(
      "global opportunity"
    ) ||
    normalized.includes(
      "international applicants"
    )
  ) {
    return "Global";
  }

  return "Africa / Global";
}

function extractDeadline(
  text: string
): string | undefined {
  const match = text.match(
    /deadline\s*[:\-–]\s*([^.|\n]{4,60})/i
  );

  return (
    match?.[1]?.trim() ||
    undefined
  );
}

function buildTags(
  text: string,
  category: string
): string[] {
  const normalized =
    text.toLowerCase();

  const tags = new Set<string>([
    category,
    "Africa",
  ]);

  const possibleTags = [
    ["nigeria", "Nigeria"],
    ["leadership", "Leadership"],
    ["technology", "Technology"],
    [
      "artificial intelligence",
      "AI",
    ],
    [
      "entrepreneur",
      "Entrepreneurship",
    ],
    ["startup", "Startups"],
    ["business", "Business"],
    ["research", "Research"],
    ["climate", "Climate"],
    ["health", "Health"],
    ["education", "Education"],
    ["women", "Women"],
    ["youth", "Youth"],
    [
      "fully funded",
      "Fully Funded",
    ],
    ["remote", "Remote"],
    ["online", "Online"],
  ];

  for (
    const [keyword, tag] of possibleTags
  ) {
    if (
      normalized.includes(keyword)
    ) {
      tags.add(tag);
    }
  }

  return Array.from(tags);
}

function mapPost(
  post: OpportunityDeskPost
): Opportunity {
  const title = removeHtml(
    post.title?.rendered
  );

  const description = removeHtml(
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
      "Opportunity Desk Programme",

    company: "Opportunity Desk",

    description,

    category,

    source: "opportunitydesk",

    location:
      detectLocation(searchableText),

    remote:
      normalizedText.includes(
        "remote"
      ) ||
      normalizedText.includes(
        "virtual"
      ) ||
      normalizedText.includes(
        "online"
      ),

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
    const params =
      new URLSearchParams({
        per_page: "30",
        orderby: "date",
        order: "desc",
        _fields:
          "id,link,title,excerpt",
      });

    const response = await fetch(
      `${OPPORTUNITY_DESK_API}?${params.toString()}`,
      {
        headers: REQUEST_HEADERS,

        next: {
          revalidate: 21600,
        },
      }
    );

    if (!response.ok) {
      console.error(
        "Opportunity Desk API error:",
        response.status
      );

      return [];
    }

    const posts =
      (await response.json()) as OpportunityDeskPost[];

    if (!Array.isArray(posts)) {
      return [];
    }

    return posts.map(mapPost);
  } catch (error) {
    console.error(
      "Opportunity Desk fetch failed:",
      error
    );

    return [];
  }
}

async function fetchPostById(
  id: string
): Promise<Opportunity | null> {
  try {
    const params =
      new URLSearchParams({
        _fields:
          "id,link,title,excerpt,content",
      });

    const response = await fetch(
      `${OPPORTUNITY_DESK_API}/${encodeURIComponent(id)}?${params.toString()}`,
      {
        headers: REQUEST_HEADERS,

        next: {
          revalidate: 21600,
        },
      }
    );

    if (!response.ok) {
      console.error(
        "Opportunity Desk lookup error:",
        response.status
      );

      return null;
    }

    const post =
      (await response.json()) as OpportunityDeskPost;

    return mapPost(post);
  } catch (error) {
    console.error(
      "Opportunity Desk lookup failed:",
      error
    );

    return null;
  }
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
      return fetchPostById(id);
    },
  };