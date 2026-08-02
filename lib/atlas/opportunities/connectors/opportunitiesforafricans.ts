import { Opportunity } from "../types";

import {
  OpportunityConnector,
} from "./types";

const OPPORTUNITIES_FOR_AFRICANS_FEED =
  "https://www.opportunitiesforafricans.com/feed/";

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

function getCategories(
  block: string
): string[] {
  return Array.from(
    block.matchAll(
      /<category(?:\s[^>]*)?>([\s\S]*?)<\/category>/gi
    ),
    (match) =>
      cleanText(match[1])
  ).filter(Boolean);
}

function createId(
  guid: string,
  url: string
): string {
  const postId =
    /[?&]p=(\d+)/i.exec(
      guid
    )?.[1];

  if (postId) {
    return `opportunitiesforafricans-${postId}`;
  }

  let hash = 0;

  for (const character of url) {
    hash =
      (hash * 31 +
        character.charCodeAt(0)) |
      0;
  }

  return `opportunitiesforafricans-${Math.abs(hash)}`;
}

function detectCategory(
  text: string
): string {
  const value =
    text.toLowerCase();

  if (
    /\b(internship|internships|trainee|immersion)\b/.test(
      value
    )
  ) {
    return "internship";
  }

  if (
    /\bfellowship\b/.test(
      value
    )
  ) {
    return "fellowship";
  }

  if (
    /\b(scholarship|scholars program|scholars programme)\b/.test(
      value
    )
  ) {
    return "scholarship";
  }

  if (
    /\b(grant|funding)\b/.test(
      value
    )
  ) {
    return "grant";
  }

  if (
    /\b(contest|competition|challenge|prize)\b/.test(
      value
    )
  ) {
    return "competition";
  }

  if (
    /\b(accelerator|incubator)\b/.test(
      value
    )
  ) {
    return "accelerator";
  }

  if (
    /\b(training|course|lab)\b/.test(
      value
    )
  ) {
    return "course";
  }

  return "programme";
}

function extractDeadline(
  description: string
): string | undefined {
  const value =
    /Application Deadline:\s*(.+?)(?=\s+Applications?\s+(?:are|is)\s+now\s+open|$)/i.exec(
      description
    )?.[1]?.trim();

  if (
    !value ||
    /^unspecified\.?$/i.test(
      value
    )
  ) {
    return undefined;
  }

  return value.replace(
    /\.$/,
    ""
  );
}

function detectLocation(
  text: string,
  categories: string[]
): string {
  const categoryText =
    categories.join(" ");

  if (
    /\bnigeria(?:n)?\b/i.test(
      `${categoryText} ${text}`
    )
  ) {
    return "Nigeria";
  }

  const countries = [
    "Ghana",
    "Kenya",
    "Rwanda",
    "South Africa",
    "Uganda",
    "Tanzania",
    "Ethiopia",
    "Senegal",
  ];

  const country =
    countries.find(
      (name) =>
        new RegExp(
          `\\b${name}\\b`,
          "i"
        ).test(
          categoryText
        )
    );

  return country || "Africa";
}

function buildTags(
  text: string,
  category: string,
  categories: string[]
): string[] {
  const value =
    text.toLowerCase();

  const tags =
    new Set<string>([
      category,
      "Africa",
    ]);

  for (
    const categoryName of
      categories.slice(0, 6)
  ) {
    if (
      categoryName.length <= 45
    ) {
      tags.add(
        categoryName
      );
    }
  }

  if (
    /\bnigeria(?:n)?\b/.test(
      value
    )
  ) {
    tags.add("Nigeria");
  }

  if (
    value.includes(
      "fully funded"
    )
  ) {
    tags.add("Fully Funded");
  }

  if (
    value.includes(
      "graduate"
    )
  ) {
    tags.add("Graduate");
  }

  if (
    value.includes(
      "entrepreneur"
    ) ||
    value.includes("sme")
  ) {
    tags.add(
      "Entrepreneurship"
    );
  }

  if (
    value.includes("youth")
  ) {
    tags.add("Youth");
  }

  if (
    value.includes(
      "leadership"
    ) ||
    value.includes(
      "leaders"
    )
  ) {
    tags.add("Leadership");
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

  const url =
    decodeEntities(
      getXmlValue(
        block,
        "link"
      )
    );

  const guid =
    decodeEntities(
      getXmlValue(
        block,
        "guid"
      )
    );

  const description =
    cleanText(
      getXmlValue(
        block,
        "description"
      )
    );

  const categories =
    getCategories(block);

  if (
    !title ||
    !url ||
    !description
  ) {
    return null;
  }

  const searchable = [
    title,
    description,
    ...categories,
  ].join(" ");

  const category =
    detectCategory(
      searchable
    );

  return {
    id: createId(
      guid,
      url
    ),

    title,

    company:
      "Opportunities for Africans",

    description,

    category,

    source:
      "opportunitiesforafricans",

    location:
      detectLocation(
        searchable,
        categories
      ),

    remote: false,

    deadline:
      extractDeadline(
        description
      ),

    url,

    tags: buildTags(
      searchable,
      category,
      categories
    ),
  };
}

async function fetchOpportunitiesForAfricans(): Promise<
  Opportunity[]
> {
  try {
    const response =
      await fetch(
        OPPORTUNITIES_FOR_AFRICANS_FEED,
        {
          headers:
            REQUEST_HEADERS,

          redirect: "follow",

          cache: "no-store",
        }
      );

    if (!response.ok) {
      console.error(
        "Opportunities for Africans feed error:",
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
        "Opportunities for Africans returned unexpected content:",
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
      "Opportunities for Africans fetch failed:",
      error
    );

    return [];
  }
}

export const OpportunitiesForAfricansConnector: OpportunityConnector =
  {
    name:
      "Opportunities for Africans",

    fetch:
      fetchOpportunitiesForAfricans,

    async getOpportunityById(
      id: string
    ): Promise<Opportunity | null> {
      const opportunities =
        await fetchOpportunitiesForAfricans();

      return (
        opportunities.find(
          (opportunity) =>
            opportunity.id === id
        ) ?? null
      );
    },
  };