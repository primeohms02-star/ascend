import { Opportunity } from "../types";

export interface OpportunityConnector {
  name: string;

  fetch(): Promise<Opportunity[]>;

  getOpportunityById(
    id: string
  ): Promise<Opportunity | null>;
}