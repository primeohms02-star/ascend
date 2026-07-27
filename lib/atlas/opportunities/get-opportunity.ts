import { fetchAllSources } from "./connectors/index.js";
import { normalizeOpportunity } from "./normalize";
import type { Opportunity } from "./types";

export async function getOpportunityById(
  id: string
): Promise<Opportunity | null> {

  const opportunities = await fetchAllSources();

  const opportunity = opportunities.find(
    (o) => o.id === id
  );

  if (!opportunity) {
    return null;
  }

  return normalizeOpportunity(opportunity);
}