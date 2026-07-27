import { fetchRemoteOK } from "../remoteok";
import { normalizeOpportunity } from "../normalize";
import { deduplicateOpportunities } from "../deduplicate";

import { WeWorkRemotelyConnector } from "./weworkremotely";
import { WellfoundConnector } from "./wellfound";
import { CourseraConnector } from "./coursera";
import { USAJobsConnector } from "./usajobs";

export async function fetchAllSources() {
  const results = await Promise.all([
    fetchRemoteOK(),

    WeWorkRemotelyConnector.fetch(),

    WellfoundConnector.fetch(),

    CourseraConnector.fetch(),

    USAJobsConnector.fetch(),
  ]);

  const normalized = results
    .flat()
    .map(normalizeOpportunity);

  return deduplicateOpportunities(
    normalized
  );
}