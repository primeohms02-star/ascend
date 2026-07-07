interface Answers {
  [key: number]: string;
}

export interface CompassRecommendation {
  direction: string;
  northStar: string;
  nextStep: string;
}

export function generateRecommendation(
  answers: Answers
): CompassRecommendation {
  const stage = answers[1];
  const destination = answers[2];

  if (
    stage === "I Recently Graduated" &&
    destination === "Working my dream job"
  ) {
    return {
      direction: "Career Growth",
      northStar:
        "Build a meaningful career by consistently improving your skills and creating opportunities.",
      nextStep:
        "Create your first professional portfolio project this week.",
    };
  }

  if (
    stage === "I'm a Student" &&
    destination === "Financially independent"
  ) {
    return {
      direction: "Skill Development",
      northStar:
        "Develop valuable skills early so your future choices become opportunities instead of limitations.",
      nextStep:
        "Choose one high-value skill and dedicate 30 minutes every day to learning it.",
    };
  }

  return {
    direction: "Personal Growth",
    northStar:
      "Keep making intentional decisions that move you toward the future you want.",
    nextStep:
      "Take one meaningful action this week that brings you closer to your goal.",
  };
}