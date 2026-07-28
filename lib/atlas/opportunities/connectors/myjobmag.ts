import { Opportunity } from "../types";
import { OpportunityConnector } from "./types";

const MYJOBMAG_FEED =
  "https://www.myjobmag.com/feeds/ng/jobsxml_by_categories.xml";

const REQUEST_HEADERS = {
  Accept:
    "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",

  "User-Agent":
    "Mozilla/5.0 (compatible; ASCEND-Opportunity-Engine/1.0; +https://www.ascendai.space)",

  Referer:
    "https://www.myjobmag.com/",
};

function decodeEntities(
  value: string
): string {
  return value
    .replace(
      /<!\[CDATA\[([\s\S]*?)\]\]>/g,
      "$1"
    )
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#039;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(
  value?: string
): string {
  const decoded = decodeEntities(
    value ?? ""
  );

  return decoded
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
  tags: string[]
): string {
  for (const tag of tags) {
    const escapedTag = tag.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const expression = new RegExp(
      `<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`,
      "i"
    );

    const value =
      expression.exec(block)?.[1];

    if (value) {
      return value;
    }
  }

  return "";
}

function createId(
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

  return `myjobmag-${Math.abs(hash)}`;
}

function detectCategory(
  text: string
): string {
  const value = text.toLowerCase();

  if (
    value.includes("internship") ||
    value.includes("intern ") ||
    value.includes("trainee") ||
    value.includes("graduate programme") ||
    value.includes("graduate program")
  ) {
    return "internship";
  }

  if (
    value.includes("scholarship") ||
    value.includes("bursary")
  ) {
    return "scholarship";
  }

  if (value.includes("fellowship")) {
    return "fellowship";
  }

  if (
    value.includes("volunteer") ||
    value.includes("volunteering")
  ) {
    return "volunteering";
  }

  if (
    value.includes("training") ||
    value.includes("course") ||
    value.includes("bootcamp")
  ) {
    return "course";
  }

  return "job";
}

function buildTags(
  text: string,
  category: string,
  feedCategory: string
): string[] {
  const value = text.toLowerCase();

  const tags = new Set<string>([
    category,
    "Nigeria",
    "Africa",
  ]);

  if (feedCategory) {
    tags.add(feedCategory);
  }

  const possibleTags: Array<
    [string, string]
  > = [
    ["remote", "Remote"],
    ["work from home", "Remote"],
    ["hybrid", "Hybrid"],
    ["technology", "Technology"],
    ["software", "Software"],
    ["developer", "Development"],
    ["data", "Data"],
    ["artificial intelligence", "AI"],
    ["machine learning", "AI"],
    ["bank", "Banking"],
    ["finance", "Finance"],
    ["account", "Accounting"],
    ["health", "Healthcare"],
    ["medical", "Healthcare"],
    ["education", "Education"],
    ["engineering", "Engineering"],
    ["marketing", "Marketing"],
    ["sales", "Sales"],
    ["customer service", "Customer Service"],
    ["human resources", "HR"],
    ["oil and gas", "Oil and Gas"],
    ["ngo", "NGO"],
    ["agriculture", "Agriculture"],
    ["graduate", "Graduate"],
    ["entry level", "Entry Level"],
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

function mapFeedItem(
  block: string
): Opportunity | null {
  const title = cleanText(
    getXmlValue(block, [
      "title",
      "position",
      "jobtitle",
      "job_title",
    ])
  );

  const url = decodeEntities(
    getXmlValue(block, [
      "link",
      "guid",
      "url",
      "joburl",
      "job_url",
    ])
  );

  if (!title || !url) {
    return null;
  }

  const company = cleanText(
    getXmlValue(block, [
      "company",
      "companyname",
      "company_name",
      "employer",
    ])
  );

  const description = cleanText(
    getXmlValue(block, [
      "description",
      "content:encoded",
      "jobdescription",
      "job_description",
      "summary",
    ])
  );

  const location = cleanText(
    getXmlValue(block, [
      "location",
      "joblocation",
      "job_location",
      "state",
      "city",
    ])
  );

  const salary = cleanText(
    getXmlValue(block, [
      "salary",
      "jobsalary",
      "job_salary",
    ])
  );

  const deadline = cleanText(
    getXmlValue(block, [
      "expiryDate",
      "expirydate",
      "deadline",
      "closingdate",
      "closing_date",
      "expiry_date",
    ])
  );

  const feedCategory = cleanText(
    getXmlValue(block, [
      "industry",
      "category",
      "jobcategory",
      "job_category",
    ])
  );

  const searchable = [
    title,
    company,
    description,
    location,
    feedCategory,
  ].join(" ");

  const category =
    detectCategory(searchable);

  const normalized =
    searchable.toLowerCase();

  return {
    id: createId(url),

    title,

    company:
      company || "MyJobMag Employer",

    description,

    category,

    source: "myjobmag",

    location:
      location || "Nigeria",

    remote:
      normalized.includes("remote") ||
      normalized.includes(
        "work from home"
      ) ||
      normalized.includes("hybrid"),

    salary:
      salary || undefined,

    deadline:
      deadline || undefined,

    url,

    tags: buildTags(
      searchable,
      category,
      feedCategory
    ),
  };
}

async function fetchMyJobMag(): Promise<
  Opportunity[]
> {
  try {
    const response = await fetch(
      MYJOBMAG_FEED,
      {
        headers: REQUEST_HEADERS,
        redirect: "follow",

        // Prevent Next.js from reusing the
        // previously cached empty response.
        cache: "no-store",
      }
    );

    console.log(
      "MyJobMag response:",
      response.status,
      response.url,
      response.headers.get("content-type")
    );

    if (!response.ok) {
      console.error(
        "MyJobMag feed error:",
        response.status
      );

      return [];
    }

    const xml = await response.text();

    const blocks =
      xml.match(
        /<item\b[\s\S]*?<\/item>/gi
      ) ?? [];

    console.log(
      "MyJobMag XML items found:",
      blocks.length
    );

    if (blocks.length === 0) {
      console.error(
        "MyJobMag returned unexpected content:",
        xml.slice(0, 300)
      );

      return [];
    }

    const opportunities = blocks
      .map(mapFeedItem)
      .filter(
        (
          opportunity
        ): opportunity is Opportunity =>
          opportunity !== null
      );

    console.log(
      "MyJobMag valid opportunities:",
      opportunities.length
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

    return Array.from(
      unique.values()
    );
  } catch (error) {
    console.error(
      "MyJobMag fetch failed:",
      error
    );

    return [];
  }
}

export const MyJobMagConnector: OpportunityConnector =
  {
    name: "MyJobMag Nigeria",

    async fetch(): Promise<
      Opportunity[]
    > {
      return fetchMyJobMag();
    },

    async getOpportunityById(
      id: string
    ): Promise<Opportunity | null> {
      const opportunities =
        await fetchMyJobMag();

      return (
        opportunities.find(
          (opportunity) =>
            opportunity.id === id
        ) ?? null
      );
    },
  };