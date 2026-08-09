import type { Opportunity } from "../types";
import type { OpportunityConnector } from "./types";

const opportunities: Opportunity[] = [
  {
    id: "boi-intervention-funds",
    title: "Bank of Industry Intervention Fund Programmes",
    company: "Bank of Industry Nigeria",
    description:
      "Access active Nigerian business funding programmes, affordable financing, mentorship and capacity-building support through the Bank of Industry's official intervention-fund portal.",
    category: "grant",
    source: "nigerianindustries",
    location: "Nigeria",
    remote: false,
    url: "https://iprogrammes.boi.ng/",
    tags: ["Nigeria", "Business", "Finance", "Funding", "Entrepreneurship", "SME"],
  },
  {
    id: "smedan-business-support",
    title: "SMEDAN Business Funding and Mentorship Support",
    company: "SMEDAN",
    description:
      "Register and access Nigerian government-backed business programmes, funding pathways, verification and mentorship for micro, small and medium-sized enterprises.",
    category: "program",
    source: "nigerianindustries",
    location: "Nigeria",
    remote: false,
    url: "https://funds.smedan.gov.ng/",
    tags: ["Nigeria", "Business", "Finance", "Funding", "Mentorship", "SME"],
  },
  {
    id: "nigeria-startup-programmes",
    title: "Nigeria Startup Accelerator and Funding Programmes",
    company: "Nigeria Startup Portal",
    description:
      "Discover official accelerator programmes, startup support, funding opportunities, investors and innovation-ecosystem resources for Nigerian founders.",
    category: "accelerator",
    source: "nigerianindustries",
    location: "Nigeria",
    remote: false,
    url: "https://www.startup.gov.ng/",
    tags: ["Nigeria", "Business", "Finance", "Startups", "Accelerator", "Entrepreneurship"],
  },
  {
    id: "lagos-fashion-week-designers-2026",
    title: "Lagos Fashion Week 2026 Designer Application",
    company: "Lagos Fashion Week",
    description:
      "Apply to present a ready-to-wear collection at Lagos Fashion Week. The official application outlines requirements for established fashion businesses and emerging designers.",
    category: "program",
    source: "nigerianindustries",
    location: "Lagos, Nigeria",
    remote: false,
    url: "https://lagosfashionweek.ng/designers-application",
    tags: ["Nigeria", "Africa", "Fashion", "Design", "Showcase", "Creative Business"],
  },
  {
    id: "lagos-fashion-week-green-access-2026",
    title: "Lagos Fashion Week Green Access 2026",
    company: "Lagos Fashion Week",
    description:
      "A flagship accelerator for emerging African fashion designers focused on sustainable innovation, craftsmanship, business growth, networks and industry access.",
    category: "accelerator",
    source: "nigerianindustries",
    location: "Africa / Nigeria",
    remote: false,
    url: "https://lagosfashionweek.ng/greenaccess/",
    tags: ["Nigeria", "Africa", "Fashion", "Accelerator", "Sustainability", "Design"],
  },
  {
    id: "lagos-paris-fashion-accelerator",
    title: "Lagos x Paris Creative Accelerator",
    company: "Création Africa Nigeria",
    description:
      "A training, mentoring and grant-supported accelerator for promising Nigerian fashion, furniture and product designers seeking international growth.",
    category: "accelerator",
    source: "nigerianindustries",
    location: "Nigeria / France",
    remote: false,
    url: "https://www.creationafricanigeria.org/lagos-x-paris-edition-2",
    tags: ["Nigeria", "Africa", "Fashion", "Business", "Grant", "Accelerator", "Design"],
  },
];

export const NigerianIndustriesConnector: OpportunityConnector = {
  name: "Nigerian Industries",

  async fetch(): Promise<Opportunity[]> {
    return opportunities;
  },

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    return opportunities.find((opportunity) => opportunity.id === id) ?? null;
  },
};
