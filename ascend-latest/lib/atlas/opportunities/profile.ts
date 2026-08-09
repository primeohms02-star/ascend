export type OpportunityProfile = {
  clerkId: string;

  careerGoal: string;

  skills: string[];

  interests: string[];

  experienceLevel:
    | "beginner"
    | "intermediate"
    | "advanced";

  education: string;

  location: string;

  preferredCountries: string[];

  remoteOnly: boolean;

  industries: string[];

  languages: string[];

  salaryExpectation?: number;
};