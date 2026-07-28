import { Opportunity } from "./types";

import { WellfoundConnector } from "./connectors/wellfound";
import { WeWorkRemotelyConnector } from "./connectors/weworkremotely";
import { USAJobsConnector } from "./connectors/usajobs";
import { CourseraConnector } from "./connectors/coursera";
import { RemotiveConnector } from "./connectors/remotive";
import { OpportunityDeskConnector } from "./connectors/opportunitydesk";
import { OpportunityForAfricaConnector } from "./connectors/opportunityforafrica";
import { MyJobMagConnector } from "./connectors/myjobmag";

const CONNECTOR_TIMEOUT = 20000;

const connectors = {
  wellfound:
    WellfoundConnector,

  weworkremotely:
    WeWorkRemotelyConnector,

  usajobs:
    USAJobsConnector,

  coursera:
    CourseraConnector,

  remotive:
    RemotiveConnector,

  opportunitydesk:
    OpportunityDeskConnector,

  opportunityforafrica:
    OpportunityForAfricaConnector,

  myjobmag:
    MyJobMagConnector,
};

async function withTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  connectorName: string
): Promise<T> {
  return new Promise<T>(
    (resolve, reject) => {
      const timer = setTimeout(
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
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    }
  );
}

export async function fetchAllSources(): Promise<
  Opportunity[]
> {
  const entries =
    Object.entries(connectors);

  const results =
    await Promise.allSettled(
      entries.map(
        ([source, connector]) =>
          withTimeout(
            connector.fetch(),
            CONNECTOR_TIMEOUT,
            source
          )
      )
    );

  return results.flatMap(
    (result, index) => {
      const source =
        entries[index]?.[0] ??
        "unknown";

      if (
        result.status === "fulfilled"
      ) {
        console.log(
          `${source} returned ${result.value.length} opportunities`
        );

        return result.value;
      }

      console.error(
        `Opportunity connector failed: ${source}`,
        result.reason
      );

      return [];
    }
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
      normalizedSource as keyof typeof connectors
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
      CONNECTOR_TIMEOUT,
      normalizedSource
    );
  } catch (error) {
    console.error(
      `Opportunity lookup failed: ${normalizedSource}`,
      error
    );

    return null;
  }
}