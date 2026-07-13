import { MemoryPattern } from "./patterns";

export type AdaptiveState = {
  missionDifficulty: "Easy" | "Medium" | "Hard";
  oracleTone:
    | "Encouraging"
    | "Balanced"
    | "Challenging";
  opportunityFocus:
    | "Learning"
    | "Career"
    | "Leadership";
};

export function buildAdaptiveState(
  patterns: MemoryPattern
): AdaptiveState {
  if (patterns.averageMood <= 2.5) {
    return {
      missionDifficulty: "Easy",
      oracleTone: "Encouraging",
      opportunityFocus: "Learning",
    };
  }

  if (patterns.averageMood <= 3.8) {
    return {
      missionDifficulty: "Medium",
      oracleTone: "Balanced",
      opportunityFocus: "Career",
    };
  }

  return {
    missionDifficulty: "Hard",
    oracleTone: "Challenging",
    opportunityFocus: "Leadership",
  };
}