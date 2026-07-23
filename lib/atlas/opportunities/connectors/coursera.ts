import { Opportunity } from "../types";
import { OpportunityConnector } from "./types";

export const CourseraConnector: OpportunityConnector = {
  name: "Coursera",

  async fetch(): Promise<Opportunity[]> {

    console.log("Fetching Coursera courses...");

    // Coursera API integration comes later

    return [];

  },
};