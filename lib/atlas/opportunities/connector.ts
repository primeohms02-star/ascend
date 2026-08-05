import { Opportunity } from "./types";

import { fetchRemoteOK } from "./remoteok";

import {
  normalizeOpportunity,
} from "./normalize";

import {
  deduplicateOpportunities,
} from "./deduplicate";

import {
  OpportunityConnector,
} from "./connectors/types";

import {
  USAJobsConnector,
} from "./connectors/usajobs";

import {
  RemotiveConnector,
} from "./connectors/remotive";

import {
  OpportunityDeskConnector,
} from "./connectors/opportunitydesk";

import {
  OpportunityForAfricaConnector,
} from "./connectors/opportunityforafrica";

import {
  MyJobMagConnector,
} from "./connectors/myjobmag";

import {
  ScholarshipRegionConnector,
} from "./connectors/scholarshipregion";

import {
  HotNigerianJobsConnector,
} from "./connectors/hotnigerianjobs";

import {
  OpportunitiesForAfricansConnector,
} from "./connectors/opportunitiesforafricans";

import {
  JobGurusConnector,
} from "./connectors/jobgurus";

import {
  MusicInAfricaConnector,
} from "./connectors/musicinafrica";

const CONNECTOR_TIMEOUT = 20000;

const HOT_NIGERIAN_JOBS_TIMEOUT =
  30000;

const MAX_CONCURRENT_CONNECTORS =
  3;

const INDUSTRY_TAG_RULES = [
  {
    tag: "Business",
    pattern:
      /\b(?:business|entrepreneur(?:ship|ial)?|startup|start-up|founder|enterprise|commerce|small\s+business|sme)\b/i,
  },
  {
    tag: "Finance",
    pattern:
      /\b(?:finance|financial|banking|banker|fintech|accounting|accountant|audit|investment|insurance|capital\s+market|wealth\s+management)\b/i,
  },
  {
    tag: "Fashion",
    pattern:
      /\b(?:fashion|apparel|clothing|garment|textile|couture|fashion\s+design|fashion\s+styling|fashion\s+brand)\b/i,
  },
] as const;

function enrichIndustryTags(
  opportunity: Opportunity
): Opportunity {
  const searchableText = [
    opportunity.title,
    opportunity.company,
    opportunity.description,
    opportunity.category,
    opportunity.location,
    ...(opportunity.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ");

  const tags = new Map(
    (opportunity.tags ?? []).map((tag) => [
      tag.toLowerCase(),
      tag,
    ])
  );

  for (const rule of INDUSTRY_TAG_RULES) {
    if (rule.pattern.test(searchableText)) {
      tags.set(rule.tag.toLowerCase(), rule.tag);
    }
  }

  return {
    ...opportunity,
    tags: Array.from(tags.values()),
  };
}

const RemoteOKConnector: OpportunityConnector =
  {
    name: "RemoteOK",

    async fetch(): Promise<
      Opportunity[]
    > {
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
  remoteok:
    RemoteOKConnector,

  usajobs:
    USAJobsConnector,

  remotive:
    RemotiveConnector,

  opportunitydesk:
    OpportunityDeskConnector,

  opportunityforafrica:
    OpportunityForAfricaConnector,

  myjobmag:
    MyJobMagConnector,

  scholarshipregion:
    ScholarshipRegionConnector,

  hotnigerianjobs:
    HotNigerianJobsConnector,

  opportunitiesforafricans:
    OpportunitiesForAfricansConnector,

  jobgurus:
    JobGurusConnector,

  musicinafrica:
    MusicInAfricaConnector,
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
      const timeoutId =
        setTimeout(() => {
          reject(
            new Error(
              `${connectorName} timed out after ${timeout}ms`
            )
          );
        }, timeout);

      promise
        .then((result) => {
          clearTimeout(
            timeoutId
          );

          resolve(result);
        })
        .catch((error) => {
          clearTimeout(
            timeoutId
          );

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
    const timeout =
      name ===
      "hotnigerianjobs"
        ? HOT_NIGERIAN_JOBS_TIMEOUT
        : CONNECTOR_TIMEOUT;

    const opportunities =
      await withTimeout(
        connector.fetch(),
        name,
        timeout
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
  const entries =
    Object.entries(
      connectors
    ) as Array<
      [
        ConnectorName,
        OpportunityConnector
      ]
    >;

  const results =
    new Array<
      Opportunity[]
    >(entries.length);

  let nextIndex = 0;

  async function runWorker(): Promise<void> {
    while (
      nextIndex <
      entries.length
    ) {
      const currentIndex =
        nextIndex;

      nextIndex += 1;

      const [
        name,
        connector,
      ] =
        entries[
          currentIndex
        ];

      results[
        currentIndex
      ] =
        await fetchConnector(
          name,
          connector
        );
    }
  }

  const workerCount =
    Math.min(
      MAX_CONCURRENT_CONNECTORS,
      entries.length
    );

  await Promise.all(
    Array.from(
      {
        length:
          workerCount,
      },
      () => runWorker()
    )
  );

  const normalized =
    results
      .flat()
      .map(
        normalizeOpportunity
      )
      .map(enrichIndustryTags);

  return deduplicateOpportunities(
    normalized
  );
}

export async function getOpportunityById(
  id: string,
  source: string
): Promise<Opportunity | null> {
  const normalizedSource =
    source
      .trim()
      .toLowerCase();

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
    const timeout =
      normalizedSource ===
      "hotnigerianjobs"
        ? HOT_NIGERIAN_JOBS_TIMEOUT
        : CONNECTOR_TIMEOUT;

    const opportunity = await withTimeout(
      connector.getOpportunityById(
        id
      ),
      normalizedSource,
      timeout
    );

    return opportunity
      ? enrichIndustryTags(opportunity)
      : null;
  } catch (error) {
    console.error(
      `Could not retrieve opportunity from ${normalizedSource}:`,
      error
    );

    return null;
  }
}
