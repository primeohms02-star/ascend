import { Opportunity } from "../types";
import { OpportunityConnector } from "./types";

export const WellfoundConnector: OpportunityConnector = {
  name: "Wellfound",

  async fetch(): Promise<Opportunity[]> {

    console.log("Fetching Wellfound opportunities...");

    // API integration comes later

    return [];

  },
};