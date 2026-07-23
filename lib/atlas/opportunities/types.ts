export type Opportunity = {
  id: string;

  title: string;

  company: string;

  description: string;

  url: string;

  source: string;

  category:
    | "job"
    | "internship"
    | "scholarship"
    | "grant"
    | "competition"
    | "course"
    | "startup";

  location: string;

  remote: boolean;

  tags: string[];   // 👈 Add this

  deadline?: string;

  score?: number;
};
export type OpportunityRanking = {
  northStar: number;
  skills: number;
  remote: number;
  saved: number;
  applied: number;
  passive: number;
  total: number;
};

export type RankedOpportunity = Opportunity & {
  ranking: OpportunityRanking;
};