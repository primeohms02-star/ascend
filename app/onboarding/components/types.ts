export type OnboardingAnswers = {
  identity: string;

  goal: string;

  skills: string[];

  challenges: string[];

  northStar: string;
};

export type OnboardingOutcome = {
  mission: {
    id: string;
    mission: string;
    reason?: string | null;
  };
};

export const initialOnboardingAnswers:
  OnboardingAnswers = {
    identity: "",

    goal: "",

    skills: [],

    challenges: [],

    northStar: "",
  };
