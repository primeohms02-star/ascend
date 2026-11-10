export type OnboardingAnswers = {
  identity: string;

  goal: string;

  skills: string[];

  challenges: string[];

  northStar: string;
};

export type OnboardingOutcome = {directionReady:boolean};

export const initialOnboardingAnswers:
  OnboardingAnswers = {
    identity: "",

    goal: "",

    skills: [],

    challenges: [],

    northStar: "",
  };
