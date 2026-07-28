import { fetchRemoteOK } from "../remoteok";
import { normalizeOpportunity } from "../normalize";
import { deduplicateOpportunities } from "../deduplicate";

import { WeWorkRemotelyConnector } from "./weworkremotely";
import { WellfoundConnector } from "./wellfound";
import { CourseraConnector } from "./coursera";
import { USAJobsConnector } from "./usajobs";
import { RemotiveConnector } from "./remotive";
import { OpportunityDeskConnector } from "./opportunitydesk";
import { OpportunityForAfricaConnector } from "./opportunityforafrica";
import { MyJobMagConnector } from "./myjobmag";

export async function fetchAllSources() {
  const results =
    await Promise.allSettled([
      fetchRemoteOK(),

      WeWorkRemotelyConnector.fetch(),

      WellfoundConnector.fetch(),

      CourseraConnector.fetch(),

      USAJobsConnector.fetch(),

      RemotiveConnector.fetch(),

      OpportunityDeskConnector.fetch(),

      OpportunityForAfricaConnector.fetch(),

      MyJobMagConnector.fetch(),
    ]);

  const opportunities =
    results.flatMap((result) => {
      if (
        result.status === "fulfilled"
      ) {
        return result.value;
      }

      console.error(
        "Opportunity connector failed:",
        result.reason
      );

      return [];
    });

  const normalized =
    opportunities.map(
      normalizeOpportunity
    );

  return deduplicateOpportunities(
    normalized
  );
}