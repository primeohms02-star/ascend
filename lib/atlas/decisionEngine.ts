import { AtlasBrainState } from "./brainState";

export type AtlasDecision = {
  priority: "growth" | "discipline" | "recovery";

  missionWeight: number;

  oracleWeight: number;

  opportunityWeight: number;

  explanation: string;
};

export function decideNextAction(
  brain: AtlasBrainState
): AtlasDecision {

  const streak =
    brain.momentum?.current_streak ?? 0;

  const progress =
    brain.progress;

  const weaknesses =
    brain.patterns.weaknesses.length;

  if (streak < 3) {
    return {
      priority: "discipline",

      missionWeight: 100,

      oracleWeight: 40,

      opportunityWeight: 20,

      explanation:
        "User needs consistency before complexity.",
    };
  }

  if (weaknesses >= 2) {
    return {
      priority: "growth",

      missionWeight: 90,

      oracleWeight: 70,

      opportunityWeight: 30,

      explanation:
        "Mission should directly target current weaknesses.",
    };
  }

  if (progress >= 80) {
    return {
      priority: "growth",

      missionWeight: 60,

      oracleWeight: 100,

      opportunityWeight: 90,

      explanation:
        "User is ready for high-impact strategic actions.",
    };
  }

  return {
    priority: "growth",

    missionWeight: 80,

    oracleWeight: 60,

    opportunityWeight: 50,

    explanation:
      "Continue steady progression toward the North Star.",
  };
}