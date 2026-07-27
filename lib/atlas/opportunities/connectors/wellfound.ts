import type { Opportunity } from "../types";
import type { OpportunityConnector } from "./types";

export const WellfoundConnector: OpportunityConnector = {
  name: "Wellfound",

  async fetch(): Promise<Opportunity[]> {
    console.log(
      "Fetching Wellfound opportunities..."
    );

    /*
     * Wellfound integration will be implemented
     * when a supported data source is connected.
     */
    return [];
  },

  async getOpportunityById(
    id: string
  ): Promise<Opportunity | null> {
    void id;

    return null;
  },
};