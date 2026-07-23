import { Opportunity } from "../types";
import { OpportunityConnector } from "./types";

export const WeWorkRemotelyConnector: OpportunityConnector = {
  name: "We Work Remotely",

  async fetch(): Promise<Opportunity[]> {

    console.log("Fetching We Work Remotely...");

    // API / scraping integration comes later

    return [];

  },
};