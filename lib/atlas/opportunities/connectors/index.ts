import { fetchRemoteOK } from "../remoteok";
import { WeWorkRemotelyConnector } from "./weworkremotely";
import { WellfoundConnector } from "./wellfound";
import { normalizeOpportunity } from "../normalize";
import { deduplicateOpportunities } from "../deduplicate";
import { CourseraConnector } from "./coursera";

import { fetchUSAJobs } from "./usajobs";

export async function fetchAllSources() {

  const results = await Promise.all([

    fetchRemoteOK(),

    WeWorkRemotelyConnector.fetch(),
    WellfoundConnector.fetch(),
      CourseraConnector.fetch(),
     fetchUSAJobs(),

  ]);

 const normalized = results
  .flat()
  .map(normalizeOpportunity);

return deduplicateOpportunities(normalized);

}