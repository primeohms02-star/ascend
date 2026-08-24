import { Opportunity } from "../types";
import { OpportunityConnector } from "./types";

type USAJobsItem = {
  MatchedObjectDescriptor: {
    PositionID: string;
    PositionTitle: string;
    OrganizationName: string;
    PositionURI: string;
    PositionLocationDisplay?: string;
    ApplicationCloseDate?: string;
    UserArea?: { Details?: { JobSummary?: string } };
  };
};

const USAJOBS_API =
  "https://data.usajobs.gov/api/search";

export const USAJobsConnector: OpportunityConnector = {
  name: "usajobs",

  async fetch(): Promise<Opportunity[]> {
    try {
      const response = await fetch(USAJOBS_API, {
        headers: {
          Host: "data.usajobs.gov",
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

      return (jobs as USAJobsItem[]).map((item): Opportunity => {
        const job = item.MatchedObjectDescriptor;

        return {
          id: job.PositionID,
          title: job.PositionTitle,
          company: job.OrganizationName,
          description:
            job.UserArea?.Details?.JobSummary ?? "",
          url: job.PositionURI,
          source: "usajobs",
          category: "job",
          location:
            job.PositionLocationDisplay ??
            "United States",
          remote: false,
          tags: [],
          deadline: job.ApplicationCloseDate,
        };
      });
    } catch (error) {
      console.error("USAJobs fetch failed:", error);
      return [];
    }
  },
async getOpportunityById(
  id: string
): Promise<Opportunity | null> {

  console.log("Looking for ID:", id);

  const opportunities = await this.fetch();

  console.log(
    "Fetched IDs:",
    opportunities.map(o => o.id)
  );

  const match = opportunities.find(
    opportunity => opportunity.id === id
  );

  console.log("Found:", !!match);

  return match ?? null;
}
  }
