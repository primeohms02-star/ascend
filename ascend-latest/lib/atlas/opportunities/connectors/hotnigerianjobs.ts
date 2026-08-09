import { Opportunity } from "../types";
import { OpportunityConnector } from "./types";

const HOT_NIGERIAN_JOBS_FEED =
  "https://www.hotnigerianjobs.com/feed/";

const MAX_FEED_ITEMS = 200;
const MAX_OPPORTUNITIES = 150;

const REQUEST_HEADERS = {
  Accept:
    "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",

  "User-Agent":
    "Mozilla/5.0 (compatible; ASCEND-Opportunity-Engine/1.0; +https://ascendai.space)",
};

function decodeEntities(
  value: string
): string {
  return value
    .replace(
      /<!\[CDATA\[([\s\S]*?)\]\]>/g,
      "$1"
    )
    .replace(
      /&#(\d+);/g,
      (_, code: string) =>
        String.fromCharCode(
          Number(code)
        )
    )
    .replace(
      /&#x([0-9a-f]+);/gi,
      (_, code: string) =>
        String.fromCharCode(
          parseInt(code, 16)
        )
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

function cleanText(
  value = ""
): string {
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

  return (
    new RegExp(
      `<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`,
      "i"
    ).exec(block)?.[1] ?? ""
  );
}

function createId(
  url: string
): string {
  const postingId =
    /\/hotjobs\/(\d+)\//i.exec(
      url
    )?.[1];

  if (postingId) {
    return `hotnigerianjobs-${postingId}`;
  }

  let hash = 0;

  for (const character of url) {
    hash =
      (hash * 31 +
        character.charCodeAt(0)) |
      0;
  }

  return `hotnigerianjobs-${Math.abs(hash)}`;
}

function isRoundup(
  title: string
): boolean {
  return (
    /job recruitment\s*\(\d+\s+positions?\)/i.test(
      title
    ) ||
    /massive recruitment/i.test(
      title
    )
  );
}

function detectCategory(
  text: string
): string {
  const value =
    text.toLowerCase();

  if (
    /\b(intern|internship)\b/.test(
      value
    )
  ) {
    return "internship";
  }

  if (
    /\b(fellowship|fellow)\b/.test(
      value
    )
  ) {
    return "fellowship";
  }

  if (
    /\b(scholarship|bursary)\b/.test(
      value
    )
  ) {
    return "scholarship";
  }

  if (
    /\b(volunteer|volunteering)\b/.test(
      value
    )
  ) {
    return "volunteering";
  }

  if (
    /\b(trainee|graduate programme|graduate program)\b/.test(
      value
    )
  ) {
    return "internship";
  }

  return "job";
}

function extractCompany(
  title: string,
  description: string
): string {
  const descriptionCompany =
    /^(.+?)\s+(?:is|are)\s+recruiting\b/i.exec(
      description
    )?.[1];

  if (descriptionCompany) {
    return descriptionCompany.trim();
  }

  const titleCompany =
    /\s+at\s+(.+)$/i.exec(
      title
    )?.[1];

  return (
    titleCompany?.trim() ||
    "Hot Nigerian Jobs Employer"
  );
}

function extractLocation(
  description: string
): string {
  const location =
    /(?:position|role|job)\s+is\s+located\s+in\s+(.+?)(?:\.\s|\.?$|\s+Salary:|\s+Interested candidates)/i.exec(
      description
    )?.[1];

  return (
    location?.trim() ||
    "Nigeria"
  );
}

function extractSalary(
  description: string
): string | undefined {
  const salary =
    /\bSalary:\s*(.+?)(?:\.\s|\.?$|\s+Interested candidates)/i.exec(
      description
    )?.[1];

  return (
    salary?.trim() ||
    undefined
  );
}

function buildTags(
  text: string,
  category: string
): string[] {
  const value =
    text.toLowerCase();

  const tags =
    new Set<string>([
      category,
      "Nigeria",
      "Africa",
    ]);

  const candidates: Array<
    [string, string]
  > = [
    ["remote", "Remote"],
    ["hybrid", "Hybrid"],
    ["graduate", "Graduate"],
    ["entry level", "Entry Level"],
    ["software", "Software"],
    ["developer", "Development"],
    ["data", "Data"],
    ["technology", "Technology"],
    ["engineering", "Engineering"],
    ["finance", "Finance"],
    ["bank", "Banking"],
    ["account", "Accounting"],
    ["marketing", "Marketing"],
    ["sales", "Sales"],
    ["health", "Healthcare"],
    ["medical", "Healthcare"],
    ["education", "Education"],
    ["human resources", "HR"],
    ["oil & gas", "Oil and Gas"],
    ["oil and gas", "Oil and Gas"],
    ["ngo", "NGO"],
    [
      "customer service",
      "Customer Service",
    ],
  ];

  for (
    const [keyword, tag] of candidates
  ) {
    if (
      value.includes(keyword)
    ) {
      tags.add(tag);
    }
  }

  return Array.from(tags);
}

function mapFeedItem(
  block: string
): Opportunity | null {
  const title = cleanText(
    getXmlValue(
      block,
      "title"
    )
  );

  const url = decodeEntities(
    getXmlValue(
      block,
      "link"
    )
  );

  const description =
    cleanText(
      getXmlValue(
        block,
        "description"
      )
    );

  if (
    !title ||
    !url ||
    !description ||
    isRoundup(title)
  ) {
    return null;
  }

  const searchable =
    `${title} ${description}`;

  const normalized =
    searchable.toLowerCase();

  const category =
    detectCategory(
      searchable
    );

  return {
    id: createId(url),

    title,

    company:
      extractCompany(
        title,
        description
      ),

    description,

    category,

    source:
      "hotnigerianjobs",

    location:
      extractLocation(
        description
      ),

    remote:
      normalized.includes(
        "remote"
      ) ||
      normalized.includes(
        "work from home"
      ) ||
      normalized.includes(
        "hybrid"
      ),

    salary:
      extractSalary(
        description
      ),

    url,

    tags: buildTags(
      searchable,
      category
    ),
  };
}

async function fetchHotNigerianJobs(): Promise<
  Opportunity[]
> {
  try {
    const response =
      await fetch(
        HOT_NIGERIAN_JOBS_FEED,
        {
          headers:
            REQUEST_HEADERS,

          redirect: "follow",

         next: {
            revalidate: 900,
          },
        }
      );

    if (!response.ok) {
      console.error(
        "Hot Nigerian Jobs feed error:",
        response.status
      );

      return [];
    }

    const xml =
      await response.text();

    const blocks =
      (
        xml.match(
          /<item\b[\s\S]*?<\/item>/gi
        ) ?? []
      ).slice(
        0,
        MAX_FEED_ITEMS
      );

    if (
      blocks.length === 0
    ) {
      console.error(
        "Hot Nigerian Jobs returned unexpected content:",
        xml.slice(0, 300)
      );

      return [];
    }

    const unique =
      new Map<
        string,
        Opportunity
      >();

    for (
      const block of blocks
    ) {
      const opportunity =
        mapFeedItem(block);

      if (opportunity) {
        unique.set(
          opportunity.id,
          opportunity
        );
      }

      if (
        unique.size >=
        MAX_OPPORTUNITIES
      ) {
        break;
      }
    }

    return Array.from(
      unique.values()
    );
  } catch (error) {
    console.error(
      "Hot Nigerian Jobs fetch failed:",
      error
    );

    return [];
  }
}

export const HotNigerianJobsConnector: OpportunityConnector =
  {
    name:
      "Hot Nigerian Jobs",

    fetch:
      fetchHotNigerianJobs,

    async getOpportunityById(
      id: string
    ): Promise<Opportunity | null> {
      const opportunities =
        await fetchHotNigerianJobs();

      return (
        opportunities.find(
          (opportunity) =>
            opportunity.id === id
        ) ?? null
      );
    },
  };