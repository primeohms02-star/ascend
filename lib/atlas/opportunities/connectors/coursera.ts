import type { Opportunity } from "../types";
import type { OpportunityConnector } from "./types";

export const CourseraConnector: OpportunityConnector = {
  name: "Coursera",

  async fetch(): Promise<Opportunity[]> {
    console.log(
      "Fetching Coursera courses..."
    );

    /*
     * Coursera integration will be implemented
     * when its real connector is added.
     */
    return [];
  },

  async getOpportunityById(
    id: string
  ): Promise<Opportunity | null> {
    /*
     * Prevent an unused-parameter warning while
     * Coursera remains a placeholder.
     */
    void id;

    return null;
  },
};