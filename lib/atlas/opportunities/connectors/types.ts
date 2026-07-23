import { Opportunity } from "../types";

export interface OpportunityConnector {
  name: string;

  fetch(profile?: unknown): Promise<Opportunity[]>;
}