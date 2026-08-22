export interface Opportunity {
  id: string;

  /**
   * Identifies the stable user-specific feed snapshot that supplied this
   * opportunity. It is carried through Decision and Action Plan routes so a
   * connector refresh cannot replace or lose the user's selected result.
   */
  snapshotId?: string;

  title: string;

  company: string;

  description?: string;

  summary?: string;

  responsibilities?: string[];

  requirements?: string[];

  benefits?: string[];

  employmentType?: string;

  category?: string;

  /**
   * Which connector produced this opportunity.
   * Examples:
   * "wellfound"
   * "remoteok"
   * "coursera"
   * "linkedin"
   * "devpost"
   */
  source: string;

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
