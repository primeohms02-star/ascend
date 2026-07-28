export type OnboardingAnswers = {
  identity: string;

  goal: string;

  challenges: string[];

  northStar: string;
};

export const initialOnboardingAnswers: OnboardingAnswers =
  {
    identity: "",

    goal: "",

    challenges: [],

    northStar: "",
  };