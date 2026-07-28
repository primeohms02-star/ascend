import { Opportunity } from "../types";
import { OpportunityConnector } from "./types";

const REMOTIVE_API =
  "https://remotive.com/api/remote-jobs";

type RemotiveJob = {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category?: string;
  job_type?: string;
  publication_date?: string;
  candidate_required_location?: string;
  salary?: string;
  description?: string;
  tags?: string[];
};

function removeHtml(value?: string): string {
  return (value ?? "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function mapRemotiveJob(
  job: RemotiveJob
): Opportunity {
  const location =
    job.candidate_required_location?.trim() ||
    "Worldwide";

  const locationText = location.toLowerCase();

  return {
    id: String(job.id),

    title: job.title,

    company: job.company_name,

    description: removeHtml(job.description),

    category: "job",

    source: "remotive",

    location,

    remote:
      locationText.includes("worldwide") ||
      locationText.includes("remote") ||
      locationText.includes("anywhere") ||
      true,

    salary: job.salary || undefined,

    url: job.url,

    tags: [
      ...(job.tags ?? []),
      ...(job.category ? [job.category] : []),
      ...(job.job_type ? [job.job_type] : []),
    ].filter(
      (tag, index, tags) =>
        Boolean(tag) &&
        tags.findIndex(
          (item) =>
            item.toLowerCase() ===
            tag.toLowerCase()
        ) === index
    ),
  };
}

async function fetchRemotiveJobs(): Promise<
  Opportunity[]
> {
  try {
    const response = await fetch(REMOTIVE_API, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 21600,
      },
    });

    if (!response.ok) {
      console.error(
        "Remotive API error:",
        response.status
      );

      return [];
    }

    const data = await response.json();

    const jobs: RemotiveJob[] = Array.isArray(
      data?.jobs
    )
      ? data.jobs
      : [];

    return jobs.map(mapRemotiveJob);
  } catch (error) {
    console.error(
      "Remotive fetch failed:",
      error
    );

    return [];
  }
}

export const RemotiveConnector: OpportunityConnector = {
  name: "Remotive",

  async fetch(): Promise<Opportunity[]> {
    return fetchRemotiveJobs();
  },

  async getOpportunityById(
    id: string
  ): Promise<Opportunity | null> {
    const opportunities =
      await fetchRemotiveJobs();

    return (
      opportunities.find(
        (opportunity) =>
          opportunity.id === id
      ) ?? null
    );
  },
};