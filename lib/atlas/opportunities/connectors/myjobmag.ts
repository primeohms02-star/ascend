import type { Opportunity } from "../types";
import type { OpportunityConnector } from "./types";

type FeedSource = {
  country: string;
  url: string;
};

type StatePage = {
  state: string;
  slug: string;
};

const MYJOBMAG_FEEDS: FeedSource[] = [
  {
    country: "Nigeria",
    url: "https://www.myjobmag.com/feeds/ng/jobsxml_by_categories.xml",
  },
  {
    country: "Kenya",
    url: "https://www.myjobmag.com/feeds/ke/jobsxml_by_categories.xml",
  },
  {
    country: "Ghana",
    url: "https://www.myjobmag.com/feeds/gh/jobsxml_by_categories.xml",
  },
];

// The general Nigeria feed naturally favours Lagos and Abuja. These focused
// pages add current listings from states that were consistently under-served.
const NIGERIAN_STATE_PAGES: StatePage[] = [
  { state: "Abia", slug: "abia" },
  { state: "Akwa Ibom", slug: "akwa-ibom" },
  { state: "Anambra", slug: "anambra" },
  { state: "Bayelsa", slug: "bayelsa" },
  { state: "Cross River", slug: "cross-river" },
  { state: "Delta", slug: "delta" },
  { state: "Ebonyi", slug: "ebonyi" },
  { state: "Edo", slug: "edo" },
  { state: "Enugu", slug: "enugu" },
  { state: "Imo", slug: "imo" },
  { state: "Ogun", slug: "ogun" },
  { state: "Ondo", slug: "ondo" },
  { state: "Rivers", slug: "rivers" },
];

const MAX_STATE_ITEMS = 8;
const STATE_PAGE_CONCURRENCY = 6;

const REQUEST_HEADERS = {
  Accept:
    "application/rss+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.8",
  "User-Agent":
    "Mozilla/5.0 (compatible; ASCEND-Opportunity-Engine/1.0; +https://www.ascendai.space)",
  Referer: "https://www.myjobmag.com/",
};

function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCharCode(Number.parseInt(code, 16)),
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

function cleanText(value?: string): string {
  return decodeEntities(value ?? "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getXmlValue(block: string, tags: string[]): string {
  for (const tag of tags) {
    const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const expression = new RegExp(
      `<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`,
      "i",
    );
    const value = expression.exec(block)?.[1];

    if (value) {
      return value;
    }
  }

  return "";
}

function createId(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return `myjobmag-${Math.abs(hash)}`;
}

function detectCategory(text: string): string {
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

  if (value.includes("scholarship") || value.includes("bursary")) {
    return "scholarship";
  }

  if (value.includes("fellowship")) {
    return "fellowship";
  }

  if (value.includes("volunteer") || value.includes("volunteering")) {
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
  feedCategory: string,
  country: string,
  region?: string,
): string[] {
  const value = text.toLowerCase();
  const tags = new Set<string>([category, country, "Africa"]);

  if (region) {
    tags.add(region);
  }

  if (feedCategory) {
    tags.add(feedCategory);
  }

  const possibleTags: Array<[string, string]> = [
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

  for (const [keyword, tag] of possibleTags) {
    if (value.includes(keyword)) {
      tags.add(tag);
    }
  }

  return Array.from(tags);
}

function isExpiredDeadline(value: string): boolean {
  if (!value) {
    return false;
  }

  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp) && timestamp < Date.now() - 86_400_000;
}

function appendCountry(location: string, country: string): string {
  if (!location) {
    return country;
  }

  if (location.toLowerCase().includes(country.toLowerCase())) {
    return location;
  }

  return `${location}, ${country}`;
}

function mapFeedItem(block: string, country: string): Opportunity | null {
  const title = cleanText(
    getXmlValue(block, ["title", "position", "jobtitle", "job_title"]),
  );
  const url = decodeEntities(
    getXmlValue(block, ["link", "guid", "url", "joburl", "job_url"]),
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
    ]),
  );
  const description = cleanText(
    getXmlValue(block, [
      "description",
      "content:encoded",
      "jobdescription",
      "job_description",
      "summary",
    ]),
  );
  const location = cleanText(
    getXmlValue(block, ["location", "joblocation", "job_location", "state", "city"]),
  );
  const salary = cleanText(
    getXmlValue(block, ["salary", "jobsalary", "job_salary"]),
  );
  const deadline = cleanText(
    getXmlValue(block, [
      "expiryDate",
      "expirydate",
      "deadline",
      "closingdate",
      "closing_date",
      "expiry_date",
    ]),
  );

  if (isExpiredDeadline(deadline)) {
    return null;
  }

  const feedCategory = cleanText(
    getXmlValue(block, ["industry", "category", "jobcategory", "job_category"]),
  );
  const searchable = [
    title,
    company,
    description,
    location,
    feedCategory,
    country,
  ].join(" ");
  const category = detectCategory(searchable);
  const normalized = searchable.toLowerCase();

  return {
    id: createId(url),
    title,
    company: company || "MyJobMag Employer",
    description,
    category,
    source: "myjobmag",
    location: appendCountry(location, country),
    remote:
      normalized.includes("remote") ||
      normalized.includes("work from home") ||
      normalized.includes("hybrid"),
    salary: salary || undefined,
    deadline: deadline || undefined,
    url,
    tags: buildTags(searchable, category, feedCategory, country),
  };
}

function mapStatePageItem(
  block: string,
  statePage: StatePage,
): Opportunity | null {
  const titleMatch = /<h2[^>]*>\s*<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i.exec(
    block,
  );
  const relativeUrl = decodeEntities(titleMatch?.[1] ?? "");
  const title = cleanText(titleMatch?.[2]);

  if (!title || !relativeUrl) {
    return null;
  }

  const linkedState = cleanText(
    /href=["']\/jobs-location\/[^"']+["'][^>]*>([\s\S]*?)<\/a>/i.exec(block)?.[1],
  );

  if (
    linkedState &&
    linkedState.toLowerCase() !== statePage.state.toLowerCase()
  ) {
    return null;
  }

  const description = cleanText(
    /<li[^>]+class=["']job-desc["'][^>]*>([\s\S]*?)<\/li>/i.exec(block)?.[1],
  );
  const logoCompany = cleanText(
    /<img[^>]+alt=["']([^"']+?)\s+logo["']/i.exec(block)?.[1],
  );
  const titleCompany = /\s+at\s+(.+)$/i.exec(title)?.[1]?.trim();
  const company = logoCompany || titleCompany || "MyJobMag Employer";
  const url = new URL(relativeUrl, "https://www.myjobmag.com").toString();
  const searchable = `${title} ${company} ${description} ${statePage.state} Nigeria`;
  const category = detectCategory(searchable);
  const normalized = searchable.toLowerCase();

  return {
    id: createId(url),
    title,
    company,
    description,
    category,
    source: "myjobmag",
    location: `${statePage.state}, Nigeria`,
    remote:
      normalized.includes("remote") ||
      normalized.includes("work from home") ||
      normalized.includes("hybrid"),
    url,
    tags: buildTags(searchable, category, "", "Nigeria", statePage.state),
  };
}

async function fetchFeed(source: FeedSource): Promise<Opportunity[]> {
  try {
    const response = await fetch(source.url, {
      headers: REQUEST_HEADERS,
      redirect: "follow",
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      console.error(`MyJobMag ${source.country} feed error:`, response.status);
      return [];
    }

    const xml = await response.text();
    const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];

    return blocks
      .map((block) => mapFeedItem(block, source.country))
      .filter((opportunity): opportunity is Opportunity => opportunity !== null);
  } catch (error) {
    console.error(`MyJobMag ${source.country} feed failed:`, error);
    return [];
  }
}

async function fetchStatePage(statePage: StatePage): Promise<Opportunity[]> {
  try {
    const response = await fetch(
      `https://www.myjobmag.com/jobs-location/${statePage.slug}`,
      {
        headers: REQUEST_HEADERS,
        redirect: "follow",
        next: { revalidate: 900 },
      },
    );

    if (!response.ok) {
      console.error(`MyJobMag ${statePage.state} page error:`, response.status);
      return [];
    }

    const html = await response.text();
    const blocks = html
      .split(/<li[^>]+class=["']job-list-li["'][^>]*>/i)
      .slice(1, MAX_STATE_ITEMS + 1);

    return blocks
      .map((block) => mapStatePageItem(block, statePage))
      .filter((opportunity): opportunity is Opportunity => opportunity !== null);
  } catch (error) {
    console.error(`MyJobMag ${statePage.state} page failed:`, error);
    return [];
  }
}

async function fetchStatePages(): Promise<Opportunity[]> {
  const results = new Array<Opportunity[]>(NIGERIAN_STATE_PAGES.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < NIGERIAN_STATE_PAGES.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await fetchStatePage(
        NIGERIAN_STATE_PAGES[currentIndex],
      );
    }
  }

  await Promise.all(
    Array.from(
      {
        length: Math.min(
          STATE_PAGE_CONCURRENCY,
          NIGERIAN_STATE_PAGES.length,
        ),
      },
      () => runWorker(),
    ),
  );

  return results.flat();
}

async function fetchMyJobMag(): Promise<Opportunity[]> {
  const [feeds, statePages] = await Promise.all([
    Promise.all(MYJOBMAG_FEEDS.map(fetchFeed)),
    fetchStatePages(),
  ]);
  const unique = new Map<string, Opportunity>();

  for (const opportunity of [...feeds.flat(), ...statePages]) {
    unique.set(opportunity.id, opportunity);
  }

  const opportunities = Array.from(unique.values());

  console.log("MyJobMag valid opportunities:", opportunities.length);
  return opportunities;
}

export const MyJobMagConnector: OpportunityConnector = {
  name: "MyJobMag Africa",

  fetch: fetchMyJobMag,

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    const opportunities = await fetchMyJobMag();

    return opportunities.find((opportunity) => opportunity.id === id) ?? null;
  },
};
