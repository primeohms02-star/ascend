export type OnboardingAnswers = {
  identity: string;

  goal: string;

  skills: string[];

  challenges: string[];

  northStar: string;
};

export const initialOnboardingAnswers:
  OnboardingAnswers = {
    identity: "",

    goal: "",

    skills: [],

    challenges: [],

    northStar: "",
  };