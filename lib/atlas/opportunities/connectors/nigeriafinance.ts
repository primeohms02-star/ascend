import type { Opportunity } from "../types";
import type { OpportunityConnector } from "./types";

const opportunities: Opportunity[] = [
  {
    id: "nigeriafinance-cfa-job-board",
    title: "CFA Society Nigeria Finance Job Board",
    company: "CFA Society Nigeria",
    description:
      "Search local and global finance, investment and analyst opportunities through CFA Society Nigeria's career centre. Confirm each role's current requirements and closing date on the original posting.",
    category: "Job",
    source: "nigeriafinance",
    location: "Nigeria / Global",
    remote: false,
    url: "https://cfasocietyng.org/society-news-resources/career-center",
    tags: ["Finance", "Investment", "Nigeria", "Africa", "Job"],
  },
  {
    id: "nigeriafinance-ican-job-centre",
    title: "ICAN Accounting and Finance Job Centre",
    company: "Institute of Chartered Accountants of Nigeria",
    description:
      "Explore accounting, audit and finance vacancies from the ICAN Job Centre. Some listings may require ICAN membership or professional qualifications.",
    category: "Job",
    source: "nigeriafinance",
    location: "Nigeria",
    remote: false,
    url: "https://icanig.org/ican/job/job-centre.php",
    tags: ["Finance", "Accounting", "Audit", "Nigeria", "Africa", "Job"],
  },
  {
    id: "nigeriafinance-firstbank-graduate",
    title: "FirstBank Graduate and Early-Career Programmes",
    company: "FirstBank Nigeria",
    description:
      "FirstBank's official careers page covers its annual graduate trainee, technology boot camp and experienced-hire pathways. Check the original page for the current application window.",
    category: "Programme",
    source: "nigeriafinance",
    location: "Nigeria",
    remote: false,
    url: "https://www.firstbanknigeria.com/home/careers/jobs/",
    tags: ["Finance", "Banking", "Graduate", "Nigeria", "Africa", "Programme"],
  },
  {
    id: "nigeriafinance-gtbank-careers",
    title: "GTBank Internship and Career Opportunities",
    company: "Guaranty Trust Bank",
    description:
      "GTBank's official career-opportunities page includes internships and professional pathways for students, graduates and experienced candidates.",
    category: "Internship",
    source: "nigeriafinance",
    location: "Nigeria",
    remote: false,
    url: "https://www.gtbank.com/about/careers/career-opportunities",
    tags: ["Finance", "Banking", "Internship", "Nigeria", "Africa"],
  },
  {
    id: "nigeriafinance-unionbank-graduate",
    title: "Union Bank Graduate Trainee and Career Programmes",
    company: "Union Bank Nigeria",
    description:
      "Union Bank's official careers page publishes graduate trainee and professional opportunities. Verify the active recruitment cycle before applying.",
    category: "Programme",
    source: "nigeriafinance",
    location: "Nigeria",
    remote: false,
    url: "https://www.unionbankng.com/careers/",
    tags: ["Finance", "Banking", "Graduate", "Nigeria", "Africa", "Programme"],
  },
];

export const NigeriaFinanceConnector: OpportunityConnector = {
  name: "Nigeria Finance Careers",
  async fetch() {
    return opportunities;
  },
  async getOpportunityById(id: string) {
    return opportunities.find((item) => item.id === id) ?? null;
  },
};
