import { Opportunity } from "../types";
import { OpportunityConnector } from "./types";

export const WeWorkRemotelyConnector: OpportunityConnector = {
  name: "weworkremotely",

  async fetch(): Promise<Opportunity[]> {
    console.log("Fetching WeWorkRemotely opportunities...");

    return [];
  },

  async getOpportunityById(
    id: string
  ): Promise<Opportunity | null> {

    const opportunities = await this.fetch();

    return (
      opportunities.find(
        (opportunity) => opportunity.id === id
      ) ?? null
    );

  },
};