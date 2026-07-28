import { Opportunity } from "./types";

import { fetchRemoteOK } from "./remoteok";

import { normalizeOpportunity } from "./normalize";
import { deduplicateOpportunities } from "./deduplicate";

import { OpportunityConnector } from "./connectors/types";

import { WellfoundConnector } from "./connectors/wellfound";
import { WeWorkRemotelyConnector } from "./connectors/weworkremotely";
import { CourseraConnector } from "./connectors/coursera";
import { USAJobsConnector } from "./connectors/usajobs";
import { RemotiveConnector } from "./connectors/remotive";
import { OpportunityDeskConnector } from "./connectors/opportunitydesk";
import { OpportunityForAfricaConnector } from "./connectors/opportunityforafrica";

import { MyJobMagConnector } from "./connectors/myjobmag";

const CONNECTOR_TIMEOUT = 20000;

const RemoteOKConnector: OpportunityConnector = {
  name: "RemoteOK",

  async fetch(): Promise<Opportunity[]> {
    return fetchRemoteOK();
  },

  async getOpportunityById(
    id: string
  ): Promise<Opportunity | null> {
    const opportunities =
      await fetchRemoteOK();

    return (
      opportunities.find(
        (opportunity) =>
          opportunity.id === id
      ) ?? null
    );
  },
};

const connectors = {
  remoteok: RemoteOKConnector,

  wellfound: WellfoundConnector,

  weworkremotely:
    WeWorkRemotelyConnector,

  coursera: CourseraConnector,

  usajobs: USAJobsConnector,

  remotive: RemotiveConnector,

  opportunitydesk:
    OpportunityDeskConnector,

  opportunityforafrica:
    OpportunityForAfricaConnector,

  
  myjobmag: MyJobMagConnector,
};

type ConnectorName =
  keyof typeof connectors;

function withTimeout<T>(
  promise: Promise<T>,
  connectorName: string,
  timeout = CONNECTOR_TIMEOUT
): Promise<T> {
  return new Promise<T>(
    (resolve, reject) => {
      const timeoutId = setTimeout(
        () => {
          reject(
            new Error(
              `${connectorName} timed out after ${timeout}ms`
            )
          );
        },
        timeout
      );

      promise
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    }
  );
}

async function fetchConnector(
  name: ConnectorName,
  connector: OpportunityConnector
): Promise<Opportunity[]> {
  try {
    const opportunities =
      await withTimeout(
        connector.fetch(),
        name
      );

    console.log(
      `${name} returned ${opportunities.length} opportunities`
    );

    return opportunities;
  } catch (error) {
    console.error(
      `Opportunity connector failed: ${name}`,
      error
    );

    return [];
  }
}

export async function fetchAllSources(): Promise<
  Opportunity[]
> {
  const entries = Object.entries(
    connectors
  ) as Array<
    [
      ConnectorName,
      OpportunityConnector
    ]
  >;

  const results = await Promise.all(
    entries.map(
      ([name, connector]) =>
        fetchConnector(
          name,
          connector
        )
    )
  );

  const normalized = results
    .flat()
    .map(normalizeOpportunity);

  return deduplicateOpportunities(
    normalized
  );
}

export async function getOpportunityById(
  id: string,
  source: string
): Promise<Opportunity | null> {
  const normalizedSource =
    source.trim().toLowerCase();

  const connector =
    connectors[
      normalizedSource as ConnectorName
    ];

  if (!connector) {
    console.error(
      "Unknown opportunity source:",
      source
    );

    return null;
  }

  try {
    return await withTimeout(
      connector.getOpportunityById(id),
      normalizedSource
    );
  } catch (error) {
    console.error(
      `Could not retrieve opportunity from ${normalizedSource}:`,
      error
    );

    return null;
  }
}