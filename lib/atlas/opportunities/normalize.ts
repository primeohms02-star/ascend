import { Opportunity } from "./types";

export function normalizeOpportunity(
  opportunity: Opportunity
): Opportunity {

  return {

    ...opportunity,

    title: opportunity.title.trim(),

    company: opportunity.company.trim(),

    location: opportunity.location.trim(),

    source: opportunity.source.trim(),

    tags: opportunity.tags.map(tag => tag.trim()),

  };

}