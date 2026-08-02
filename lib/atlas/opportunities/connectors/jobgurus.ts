import { Opportunity } from "../types";

import {
  OpportunityConnector,
} from "./types";

const JOBGURUS_FEED =
  "https://www.jobgurus.com.ng/jobs/feed";

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
  const escapedTag =
    tag.replace(
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
  let hash = 0;

  for (const character of url) {
    hash =
      (hash * 31 +
        character.charCodeAt(0)) |
      0;
  }

  return `jobgurus-${Math.abs(
    hash
  )}`;
}

function detectCategory(
  text: string
): string {
  const value =
    text.toLowerCase();

  if (
    /\b(intern|internship|industrial training|trainee)\b/.test(
      value
    )
  ) {
    return "internship";
  }

  if (
    /\b(scholarship|bursary)\b/.test(
      value
    )
  ) {
    return "scholarship";
  }

  if (
    /\bfellowship\b/.test(
      value
    )
  ) {
    return "fellowship";
  }

  if (
    /\bgrant\b/.test(
      value
    )
  ) {
    return "grant";
  }

  return "job";
}

function normalizeDeadline(
  value: string
): string | undefined {
  if (!value) {
    return undefined;
  }

  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? cleanText(value) ||
        undefined
    : date
        .toISOString()
        .slice(0, 10);
}

function buildTags(
  text: string,
  category: string,
  specialization: string,
  location: string,
  workLevel: string,
  jobType: string
): string[] {
  const value =
    text.toLowerCase();

  const tags =
    new Set<string>([
      category,
      "Nigeria",
      "Africa",
    ]);

  for (
    const tag of [
      specialization,
      location,
      workLevel,
      jobType,
    ]
  ) {
    if (tag) {
      tags.add(tag);
    }
  }

  if (
    value.includes("remote")
  ) {
    tags.add("Remote");
  }

  if (
    value.includes("hybrid")
  ) {
    tags.add("Hybrid");
  }

  if (
    value.includes(
      "graduate"
    ) ||
    value.includes(
      "freshers"
    )
  ) {
    tags.add("Graduate");
  }

  if (
    value.includes(
      "entry level"
    )
  ) {
    tags.add("Entry Level");
  }

  if (
    value.includes(
      "software"
    ) ||
    value.includes(
      "programming"
    )
  ) {
    tags.add("Technology");
  }

  if (
    value.includes("data")
  ) {
    tags.add("Data");
  }

  if (
    value.includes(
      "engineering"
    )
  ) {
    tags.add("Engineering");
  }

  if (
    value.includes("finance") ||
    value.includes(
      "accounting"
    )
  ) {
    tags.add("Finance");
  }

  if (
    value.includes("ngo") ||
    value.includes(
      "community services"
    )
  ) {
    tags.add("NGO");
  }

  return Array.from(tags);
}

function mapFeedItem(
  block: string
): Opportunity | null {
  const title =
    cleanText(
      getXmlValue(
        block,
        "title"
      )
    );

  const url =
    decodeEntities(
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

  const company =
    cleanText(
      getXmlValue(
        block,
        "company"
      )
    );

  const location =
    cleanText(
      getXmlValue(
        block,
        "location"
      )
    );

  const specialization =
    cleanText(
      getXmlValue(
        block,
        "specialization"
      )
    );

  const workLevel =
    cleanText(
      getXmlValue(
        block,
        "workLevel"
      )
    );

  const jobType =
    cleanText(
      getXmlValue(
        block,
        "jobType"
      )
    );

  const salaryRange =
    cleanText(
      getXmlValue(
        block,
        "salaryRange"
      )
    );

  const deadline =
    normalizeDeadline(
      cleanText(
        getXmlValue(
          block,
          "deadlineDate"
        )
      )
    );

  if (!title || !url) {
    return null;
  }

  const searchable = [
    title,
    company,
    description,
    specialization,
    workLevel,
    jobType,
  ].join(" ");

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
      company ||
      "JobGurus Employer",

    description,

    category,

    source: "jobgurus",

    location:
      location || "Nigeria",

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
      salaryRange
        ? `₦${salaryRange}`
        : undefined,

    deadline,

    url,

    tags: buildTags(
      searchable,
      category,
      specialization,
      location,
      workLevel,
      jobType
    ),
  };
}

async function fetchJobGurus(): Promise<
  Opportunity[]
> {
  try {
    const response =
      await fetch(
        JOBGURUS_FEED,
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
        "JobGurus feed error:",
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

    if (
      blocks.length === 0
    ) {
      console.error(
        "JobGurus returned unexpected content:",
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
    }

    return Array.from(
      unique.values()
    );
  } catch (error) {
    console.error(
      "JobGurus fetch failed:",
      error
    );

    return [];
  }
}

export const JobGurusConnector: OpportunityConnector =
  {
    name:
      "JobGurus Nigeria",

    fetch:
      fetchJobGurus,

    async getOpportunityById(
      id: string
    ): Promise<Opportunity | null> {
      const opportunities =
        await fetchJobGurus();

      return (
        opportunities.find(
          (opportunity) =>
            opportunity.id === id
        ) ?? null
      );
    },
  };