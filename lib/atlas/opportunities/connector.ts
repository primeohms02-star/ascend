import { Opportunity } from "./types";

import { WellfoundConnector } from "./connectors/wellfound";
import { WeWorkRemotelyConnector } from "./connectors/weworkremotely";
import { USAJobsConnector } from "./connectors/usajobs";

const connectors = {
  wellfound: WellfoundConnector,
  weworkremotely: WeWorkRemotelyConnector,
  usajobs: USAJobsConnector,
};

export async function fetchAllSources(): Promise<Opportunity[]> {

  const results = await Promise.all(
    Object.values(connectors).map((connector) =>
      connector.fetch()
    )
  );

  return results.flat();
}

export async function getOpportunityById(
  id: string,
  source: string
): Promise<Opportunity | null> {

  const connector =
    connectors[
      source as keyof typeof connectors
    ];

  if (!connector) {
    return null;
  }

  return connector.getOpportunityById(id);
}