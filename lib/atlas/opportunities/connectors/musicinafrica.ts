import type {
  Opportunity,
} from "../types";

import type {
  OpportunityConnector,
} from "./types";

const API_URL =
  "https://musicinafrica.net/wp-json/wp/v2/posts";

const USER_AGENT =
  "Mozilla/5.0 (compatible; ASCEND-Opportunity-Engine/1.0; +https://ascendai.space)";

const SEARCH_TERMS = [
  "open call",
  "call for applications",
  "applications",
];

const MAX_POST_AGE_DAYS = 180;

const OPPORTUNITY_SIGNALS =
  /\b(?:open call|call for applications|applications? open|apply now|auditions?|competition|fund(?:ing)?|grant|residenc(?:y|ies)|showcase|fellowship|accelerator|incubator|programme|program|training|workshop|mentorship)\b/i;

const MUSIC_SIGNALS =
  /\b(?:music|musician|artist|singer|songwriter|composer|producer|dj|audio|sound|recording|record label|festival|showcase|performance|performer|band|creative|cultural|arts?)\b/i;

const EXCLUDED_SIGNALS =
  /\b(?:game designer|gaming|photographer|photography|filmmaker|film festival|fashion designer|visual artist)\b/i;

type MusicInAfricaPost = {
  id: number;

  date?: string;

  link?: string;

  title?: {
    rendered?: string;
  };
};

function decodeHtml(
  value: string
): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#038;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#8216;|&#8217;/gi, "'")
    .replace(/&#8220;|&#8221;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function isMusicOpportunity(
  title: string
): boolean {
  return (
    OPPORTUNITY_SIGNALS.test(
      title
    ) &&
    MUSIC_SIGNALS.test(title) &&
    !EXCLUDED_SIGNALS.test(title)
  );
}

function detectCategory(
  title: string
): string {
  if (/\bintern(?:ship)?\b/i.test(title)) {
    return "Internship";
  }

  if (
    /\b(?:coordinator|officer|director|manager|head of|vacancy|job)\b/i.test(
      title
    )
  ) {
    return "Job";
  }

  if (/\bgrant|fund(?:ing)?\b/i.test(title)) {
    return "Grant";
  }

  if (/\bcompetition|audition\b/i.test(title)) {
    return "Competition";
  }

  if (/\bfellowship\b/i.test(title)) {
    return "Fellowship";
  }

  if (/\baccelerator|incubator\b/i.test(title)) {
    return "Accelerator";
  }

  if (/\btraining|workshop\b/i.test(title)) {
    return "Course";
  }

  if (/\bmentorship\b/i.test(title)) {
    return "Mentorship";
  }

  return "Programme";
}

function detectLocation(
  title: string
): string {
  if (/\bnigeria|nigerian\b/i.test(title)) {
    return "Nigeria";
  }

  if (/\bafrica|african\b/i.test(title)) {
    return "Africa";
  }

  const countrySignals: Array<
    [RegExp, string]
  > = [
    [/\bsa|south africa|cape town|johannesburg\b/i, "South Africa"],
    [/\bkenya|kenyan\b/i, "Kenya"],
    [/\btanzania|tanzanian\b/i, "Tanzania"],
    [/\bmozambique|mozambican\b/i, "Mozambique"],
    [/\bghana|ghanaian\b/i, "Ghana"],
    [/\buganda|ugandan\b/i, "Uganda"],
    [/\brwanda|rwandan\b/i, "Rwanda"],
    [/\beSwatini|swaziland\b/i, "eSwatini"],
  ];

  for (const [pattern, country] of countrySignals) {
    if (pattern.test(title)) {
      return country;
    }
  }

  return "Africa / Global";
}

function buildTags(
  title: string,
  category: string,
  location: string
): string[] {
  const tags = new Set<string>([
    "Music",
    "Entertainment",
    category,
  ]);

  if (location === "Nigeria") {
    tags.add("Nigeria");
    tags.add("Africa");
  } else if (location === "Africa") {
    tags.add("Africa");
  } else {
    tags.add("Global");
  }

  const signals: Array<
    [RegExp, string]
  > = [
    [/\bartist|performer\b/i, "Artist"],
    [/\bproducer|production\b/i, "Producer"],
    [/\bsongwriter|composer\b/i, "Songwriting"],
    [/\bdj\b/i, "DJ"],
    [/\bfestival|showcase\b/i, "Live Music"],
    [/\bcreative|cultural|arts?\b/i, "Creative Industries"],
  ];

  for (const [pattern, tag] of signals) {
    if (pattern.test(title)) {
      tags.add(tag);
    }
  }

  return Array.from(tags);
}

function toOpportunity(
  post: MusicInAfricaPost
): Opportunity | null {
  const title = decodeHtml(
    post.title?.rendered ?? ""
  );

  const url =
    post.link?.trim() ?? "";

  if (
    !title ||
    !url ||
    !isRecentPost(post.date) ||
    !isMusicOpportunity(title)
  ) {
    return null;
  }

  const category =
    detectCategory(title);

  const location =
    detectLocation(title);

  return {
    id: `musicinafrica-${post.id}`,
    title,
    company: "Music In Africa",
    description:
      "An application opportunity for musicians, artists or music-industry professionals published by Music In Africa. Open the original posting to confirm eligibility, requirements and the current deadline.",
    category,
    source: "musicinafrica",
    location,
    remote: false,
    url,
    tags: buildTags(
      title,
      category,
      location
    ),
  };
}

function isRecentPost(
  date?: string
): boolean {
  if (!date) {
    return false;
  }

  const publishedAt =
    new Date(date).getTime();

  if (!Number.isFinite(publishedAt)) {
    return false;
  }

  const oldestAllowed =
    Date.now() -
    MAX_POST_AGE_DAYS *
      24 *
      60 *
      60 *
      1000;

  return publishedAt >= oldestAllowed;
}

async function fetchSearch(
  search: string
): Promise<MusicInAfricaPost[]> {
  const url = new URL(API_URL);

  url.searchParams.set(
    "search",
    search
  );

  url.searchParams.set(
    "per_page",
    "30"
  );

  url.searchParams.set(
    "orderby",
    "date"
  );

  url.searchParams.set(
    "order",
    "desc"
  );

  url.searchParams.set(
    "_fields",
    "id,date,link,title"
  );

  const response = await fetch(
    url,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      next: {
        revalidate: 1800,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Music In Africa API returned ${response.status}`
    );
  }

  const data: unknown =
    await response.json();

  return Array.isArray(data)
    ? (data as MusicInAfricaPost[])
    : [];
}

async function fetchMusicInAfrica(): Promise<
  Opportunity[]
> {
  try {
    const results =
      await Promise.all(
        SEARCH_TERMS.map(
          fetchSearch
        )
      );

    const posts = new Map<
      number,
      MusicInAfricaPost
    >();

    for (const post of results.flat()) {
      posts.set(post.id, post);
    }

    return Array.from(
      posts.values()
    )
      .map(toOpportunity)
      .filter(
        (
          opportunity
        ): opportunity is Opportunity =>
          opportunity !== null
      );
  } catch (error) {
    console.error(
      "Music In Africa fetch failed:",
      error
    );

    return [];
  }
}

async function fetchPostById(
  id: string
): Promise<Opportunity | null> {
  const numericId = id
    .replace(
      /^musicinafrica-/,
      ""
    )
    .trim();

  if (!/^\d+$/.test(numericId)) {
    return null;
  }

  try {
    const response = await fetch(
      `${API_URL}/${numericId}?_fields=id,date,link,title`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": USER_AGENT,
        },
        next: {
          revalidate: 1800,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const post =
      (await response.json()) as MusicInAfricaPost;

    return toOpportunity(post);
  } catch (error) {
    console.error(
      "Music In Africa lookup failed:",
      error
    );

    return null;
  }
}

export const MusicInAfricaConnector: OpportunityConnector =
  {
    name: "Music In Africa",

    fetch:
      fetchMusicInAfrica,

    async getOpportunityById(
      id: string
    ): Promise<Opportunity | null> {
      return fetchPostById(id);
    },
  };
