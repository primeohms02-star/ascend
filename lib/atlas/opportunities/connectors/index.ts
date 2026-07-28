import { Opportunity } from "../types";

import { fetchRemoteOK } from "../remoteok";

import { normalizeOpportunity } from "../normalize";
import { deduplicateOpportunities } from "../deduplicate";

import { WellfoundConnector } from "./wellfound";
import { WeWorkRemotelyConnector } from "./weworkremotely";
import { CourseraConnector } from "./coursera";
import { USAJobsConnector } from "./usajobs";
import { RemotiveConnector } from "./remotive";
import { OpportunityDeskConnector } from "./opportunitydesk";
import { OpportunityForAfricaConnector } from "./opportunityforafrica";

import { MyJobMagConnector } from "./myjobmag";

type Source = {
  name: string;
  fetch: () => Promise<Opportunity[]>;
};

const sources: Source[] = [
  {
    name: "remoteok",
    fetch: fetchRemoteOK,
  },
  {
    name: "wellfound",
    fetch: () =>
      WellfoundConnector.fetch(),
  },
  {
    name: "weworkremotely",
    fetch: () =>
      WeWorkRemotelyConnector.fetch(),
  },
  {
    name: "coursera",
    fetch: () =>
      CourseraConnector.fetch(),
  },
  {
    name: "usajobs",
    fetch: () =>
      USAJobsConnector.fetch(),
  },
  {
    name: "remotive",
    fetch: () =>
      RemotiveConnector.fetch(),
  },
  {
    name: "opportunitydesk",
    fetch: () =>
      OpportunityDeskConnector.fetch(),
  },
  {
    name: "opportunityforafrica",
    fetch: () =>
      OpportunityForAfricaConnector.fetch(),
  },
 
  {
    name: "myjobmag",
    fetch: () =>
      MyJobMagConnector.fetch(),
  },
];

async function fetchSource(
  source: Source
): Promise<Opportunity[]> {
  try {
    const opportunities =
      await source.fetch();

    console.log(
      `${source.name} returned ${opportunities.length} opportunities`
    );

    return opportunities;
  } catch (error) {
    console.error(
      `Opportunity source failed: ${source.name}`,
      error
    );

    return [];
  }
}

export async function fetchAllSources(): Promise<
  Opportunity[]
> {
  const results = await Promise.all(
    sources.map(fetchSource)
  );

  const normalized = results
    .flat()
    .map(normalizeOpportunity);

  return deduplicateOpportunities(
    normalized
  );
}