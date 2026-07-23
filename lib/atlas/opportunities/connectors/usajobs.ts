import { Opportunity } from "../types";

const USAJOBS_API =
  "https://data.usajobs.gov/api/search";

export async function fetchUSAJobs(): Promise<Opportunity[]> {
  try {
    const response = await fetch(USAJOBS_API, {
      headers: {
        "Host": "data.usajobs.gov",
        "User-Agent": process.env.USAJOBS_EMAIL!,
        "Authorization-Key": process.env.USAJOBS_API_KEY!,
      },
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      console.error("USAJobs API Error:", response.status);
      return [];
    }

    const data = await response.json();

    const jobs =
      data?.SearchResult?.SearchResultItems ?? [];

    return jobs.map((item: any): Opportunity => {
      const job = item.MatchedObjectDescriptor;

      return {
        id: job.PositionID,
        title: job.PositionTitle,
        company: job.OrganizationName,
        description: job.UserArea?.Details?.JobSummary ?? "",
        url: job.PositionURI,
        source: "USAJobs",
        category: "job",
        location:
          job.PositionLocationDisplay ?? "United States",
        remote: false,
        tags: [],
        deadline: job.ApplicationCloseDate,
        score: undefined,
      };
    });
  } catch (error) {
    console.error("USAJobs fetch failed:", error);
    return [];
  }
}