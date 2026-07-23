export interface Opportunity {
  id: string;

  title: string;

  company: string;

  description?: string;

  category?: string;

  source?: string;

  location?: string;

  remote?: boolean;

  salary?: string;

  deadline?: string;

  url?: string;

  tags: string[];

  score?: number;
}

export interface RankedOpportunity extends Opportunity {
  score: number;
}