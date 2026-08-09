import type { Opportunity } from "../types";
import type { OpportunityConnector } from "./types";

const opportunities: Opportunity[] = [
  {
    id: "africanfashionfoundation-futures-incubator",
    title: "African Fashion Futures Incubator",
    company: "African Fashion Foundation",
    description:
      "An intensive pathway for African fashion entrepreneurs offering business mentorship, global networks and seed support. Check the official project page for the next application cycle.",
    category: "Accelerator",
    source: "africanfashionfoundation",
    location: "Africa",
    remote: false,
    url: "https://africanfashionfoundation.org/projects",
    tags: ["Fashion", "Business", "Entrepreneurship", "Africa", "Accelerator"],
  },
  {
    id: "africanfashionfoundation-roberta-annan",
    title: "Roberta Annan Fashion Scholarship",
    company: "African Fashion Foundation",
    description:
      "An annual scholarship supporting talented African students pursuing fashion, arts and business education. Check the official project page for eligibility and the next application window.",
    category: "Scholarship",
    source: "africanfashionfoundation",
    location: "Africa",
    remote: false,
    url: "https://africanfashionfoundation.org/projects",
    tags: ["Fashion", "Scholarship", "Education", "Africa"],
  },
];

export const AfricanFashionFoundationConnector: OpportunityConnector = {
  name: "African Fashion Foundation",
  async fetch() {
    return opportunities;
  },
  async getOpportunityById(id: string) {
    return opportunities.find((item) => item.id === id) ?? null;
  },
};
